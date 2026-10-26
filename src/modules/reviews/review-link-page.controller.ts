import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';

const APP_SCHEME = 'sportsmaster';
const ANDROID_PACKAGE = 'sports.master';

// 리뷰 요청 공유 링크 중계 페이지 (인증 없음)
// 메신저(카카오톡·문자)는 커스텀 스킴(sportsmaster://)을 링크로 인식하지 않아 https 링크로 공유하고,
// 이 페이지가 앱 딥링크로 넘겨준다. Android Chrome 계열은 intent:// 가 있어야 앱이 열린다.
@ApiExcludeController()
@Controller('r')
export class ReviewLinkPageController {
  @Get('review')
  reviewPage(@Query('token') token = '', @Headers('user-agent') userAgent = '', @Res() res: Response) {
    // JWT(base64url + '.')만 통과 — HTML/URL 삽입 방지
    const safeToken = /^[\w.-]+$/.test(token) ? token : '';
    const path = `review?token=${safeToken}`;
    const appUrl = /android/i.test(userAgent)
      ? `intent://${path}#Intent;scheme=${APP_SCHEME};package=${ANDROID_PACKAGE};end`
      : `${APP_SCHEME}://${path}`;

    res
      .type('html')
      .set('Cache-Control', 'no-store')
      .send(
        `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${safeToken ? `<meta http-equiv="refresh" content="0;url=${appUrl}">` : ''}
<title>운동명인 리뷰 작성</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #F2F2F2; color: #1F2A43; font-family: -apple-system, 'Apple SD Gothic Neo', sans-serif; }
  main { padding: 24px; text-align: center; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  p { font-size: 14px; color: #74768E; margin: 0 0 24px; line-height: 1.5; }
  a { display: inline-block; padding: 14px 28px; border-radius: 8px; background: #C6A75E; color: #fff;
    font-size: 16px; text-decoration: none; }
</style>
</head>
<body>
<main>
${
  safeToken
    ? `<h1>운동명인 앱에서 리뷰를 작성해 주세요</h1>
<p>앱이 자동으로 열리지 않으면 아래 버튼을 눌러주세요.<br>앱이 없다면 스토어에서 '운동명인'을 설치한 뒤 링크를 다시 열어주세요.</p>
<a href="${appUrl}">앱에서 열기</a>`
    : `<h1>올바르지 않은 링크입니다</h1>
<p>명인에게 리뷰 링크를 다시 요청해 주세요.</p>`
}
</main>
</body>
</html>`,
      );
  }
}
