// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** sendSms POST /api/sms/sendSms */
export async function sendSmsUsingPost(body: API.SmsRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/sms/sendSms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
