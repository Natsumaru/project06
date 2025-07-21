import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser {
  user: any;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
