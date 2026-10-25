// R2 업로드 E2E 점검 — 로컬 API(기본 http://localhost:3101)에 테스트 명인 계정을 만들고
// 업로드 → 프로필 저장 → 공개 URL 확인 → 파일 정리까지 순서대로 확인한다.
// 사용: node --env-file=.env scripts/r2-upload-e2e.mjs [API_BASE_URL]
// 주의: 테스트 계정(e2e-r2-*@example.com)은 로컬 DB에 남는다. R2에 올린 테스트 파일은 끝에서 삭제한다.
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

const API = process.argv[2] ?? 'http://localhost:3101'
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE_URL
// 1x1 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')

const uploaded = []
let failed = false
const step = (ok, label, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failed = true
  return ok
}

async function api(path, { token, ...init } = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

const json = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

function form(files) {
  const fd = new FormData()
  for (const [field, buf, name, type] of files) fd.append(field, new Blob([buf], { type }), name)
  return fd
}

async function publicStatus(url) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) return res.status
    await new Promise((r) => setTimeout(r, 1000))
  }
  return (await fetch(url, { cache: 'no-store' })).status
}

async function main() {
  // 1. 테스트 명인 가입 → 명인 프로필 자동 생성 확인
  const stamp = Date.now()
  const reg = await api(
    '/auth/register',
    json({
      email: `e2e-r2-${stamp}@example.com`,
      password: 'Test1234!',
      nickname: `e2e${String(stamp).slice(-8)}`,
      mode: 'expert',
    })
  )
  const token = reg.body?.data?.accessToken
  if (!step(!!token, '1. 테스트 명인 가입', `HTTP ${reg.status}`)) return

  const me = await api('/expert-profiles/me', { token })
  step(me.status === 200, '2. 명인 프로필 자동 생성 (GET me)', `HTTP ${me.status}`)

  // 2. 이미지 2장 업로드
  const img = await api('/expert-profiles/me/uploads?kind=image', {
    token,
    method: 'POST',
    body: form([
      ['files', PNG, '사진 1.png', 'image/png'],
      ['files', PNG, 'photo2.png', 'image/png'],
    ]),
  })
  const imageUrls = img.body?.data?.urls ?? []
  uploaded.push(...imageUrls)
  step(
    img.status === 201 && imageUrls.length === 2 && imageUrls.every((u) => u.startsWith(`${PUBLIC_BASE}/`)),
    '3. 이미지 업로드 (kind=image)',
    `HTTP ${img.status}, ${imageUrls.length}개`
  )

  // 3. PDF 업로드
  const pdf = await api('/expert-profiles/me/uploads?kind=pdf', {
    token,
    method: 'POST',
    body: form([['files', PDF, 'portfolio.pdf', 'application/pdf']]),
  })
  const pdfUrl = pdf.body?.data?.urls?.[0]
  if (pdfUrl) uploaded.push(pdfUrl)
  step(pdf.status === 201 && !!pdfUrl, '4. PDF 업로드 (kind=pdf)', `HTTP ${pdf.status}`)

  // 4. 잘못된 형식 거부
  const bad = await api('/expert-profiles/me/uploads?kind=image', {
    token,
    method: 'POST',
    body: form([['files', PDF, 'x.pdf', 'application/pdf']]),
  })
  step(bad.status === 400, '5. 이미지 업로드에 PDF 거부', `HTTP ${bad.status}`)

  // 5. 프로필 저장 + 조회
  const patch = await api('/expert-profiles/me', {
    token,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region: '서울 > 강남구', portfolioImageUrls: imageUrls, educationPdfUrl: pdfUrl }),
  })
  step(patch.status === 200, '6. 프로필 저장 (PATCH me)', `HTTP ${patch.status}`)
  const after = await api('/expert-profiles/me', { token })
  const saved = after.body?.data
  step(
    JSON.stringify(saved?.portfolioImageUrls) === JSON.stringify(imageUrls) && saved?.educationPdfUrl === pdfUrl,
    '7. 저장값 재조회 일치'
  )

  // 6. 외부 URL 저장 거부
  const foreign = await api('/expert-profiles/me', {
    token,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolioImageUrls: ['https://evil.example.com/a.png'] }),
  })
  step(foreign.status === 400, '8. 외부 URL 저장 거부', `HTTP ${foreign.status}`)

  // 7. 공개 URL 접근
  for (const [i, url] of [...imageUrls, pdfUrl].filter(Boolean).entries()) {
    const status = await publicStatus(url)
    step(status === 200, `9-${i + 1}. 공개 URL 열림`, `HTTP ${status}`)
  }

  // 8. 이미지 1장 빼고 저장 → R2에서 삭제되는지
  const removed = imageUrls[1]
  await api('/expert-profiles/me', {
    token,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolioImageUrls: [imageUrls[0]] }),
  })
  const removedStatus = removed ? (await fetch(removed, { cache: 'no-store' })).status : 0
  step(removedStatus === 404, '10. 뺀 이미지 R2에서 삭제', `HTTP ${removedStatus} (r2.dev 캐시로 잠시 200일 수 있음)`)

  // 9. 명인인증 업로드
  const cert = await api('/certifications', {
    token,
    method: 'POST',
    body: form([['file', PNG, 'license.png', 'image/png']]),
  })
  const certUrl = cert.body?.data?.fileUrls?.[0]
  if (certUrl) uploaded.push(certUrl)
  step(cert.status === 201 && certUrl?.startsWith(`${PUBLIC_BASE}/`), '11. 명인인증 업로드', `HTTP ${cert.status}`)
  if (certUrl) step((await publicStatus(certUrl)) === 200, '12. 명인인증 파일 공개 URL 열림')
}

async function cleanup() {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
  for (const url of uploaded) {
    const key = url.slice(PUBLIC_BASE.length + 1)
    await client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key })).catch(() => {})
  }
  console.log(`🧹 테스트 파일 ${uploaded.length}개 R2에서 삭제`)
}

main()
  .catch((error) => {
    failed = true
    console.error('❌ 실행 오류:', error.message)
  })
  .finally(async () => {
    await cleanup()
    process.exit(failed ? 1 : 0)
  })
