import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(utilisateurId: string) {
    const [items, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { utilisateurId },
        orderBy: { dateCreation: 'desc' },
        take: 30,
      }),
      this.prisma.notification.count({ where: { utilisateurId, lue: false } }),
    ]);
    return { items, unread };
  }

  async markRead(utilisateurId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, utilisateurId },
      select: { id: true },
    });
    if (!notification) throw new NotFoundException('Notification introuvable.');
    return this.prisma.notification.update({
      where: { id: notification.id },
      data: { lue: true },
    });
  }
}
