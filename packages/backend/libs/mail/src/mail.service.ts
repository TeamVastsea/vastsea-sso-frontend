import { ConfigService } from '@app/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private logger = new Logger(MailerService.name);
  constructor(
    private mail: MailerService,
    private config: ConfigService,
  ) {}
  send({
    content,
    to,
    subject,
    html,
  }: {
    content?: string;
    to: string;
    subject: string;
    html?: string;
  }) {
    if (__DEV__) {
      return Promise.resolve(true).then((ok) => ok);
    }
    return this.mail
      .sendMail({
        to,
        from: this.config.get('email.email') ?? 'admin@no-reply.com',
        subject,
        text: content,
        html,
      })
      .then(() => true)
      .catch((err) => {
        this.logger.error(err.message, err.stack);
        throw err;
      });
  }
}
