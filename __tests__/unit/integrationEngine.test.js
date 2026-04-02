const { sendNotification } = require('../../src/services/integrationEngine');
const { NotificationConfig, Log } = require('../../src/models');
const nodemailer = require('nodemailer');

jest.mock('../../src/models', () => ({
  NotificationConfig: {
    findAll: jest.fn(),
  },
  Log: {
    create: jest.fn(),
  },
}));

jest.mock('nodemailer');

describe('Integration Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should send email when config is active', async () => {
    NotificationConfig.findAll.mockResolvedValue([
      {
        channel: 'email',
        config: {
          host: 'smtp.test.com',
          port: 587,
          auth: { user: 'user', pass: 'pass' },
          from: 'from@test.com',
          to: 'to@test.com',
        },
        isActive: true,
      },
    ]);

    const sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' });
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

    const notification = {
      id: 2,
      severity: 'critical',
      message: 'Critical alert',
      sentAt: new Date(),
    };

    await sendNotification(notification);

    expect(sendMailMock).toHaveBeenCalled();
    expect(Log.create).toHaveBeenCalled();
  });

  test('should skip if no active configs', async () => {
    NotificationConfig.findAll.mockResolvedValue([]);

    await sendNotification({ id: 3 });

    expect(nodemailer.createTransport).not.toHaveBeenCalled();
    expect(Log.create).not.toHaveBeenCalled();
  });
});