import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateMeetingInput,
  CreateMeetingResult,
  IMeetingProviderService,
} from '../meeting/meeting-provider.interface';

@Injectable()
export class ZoomMeetingService implements IMeetingProviderService {
  private readonly tokenUrl = 'https://zoom.us/oauth/token';
  private readonly apiBaseUrl = 'https://api.zoom.us/v2';

  private getRequiredValue(
    credentials: Record<string, any> | undefined,
    key: string,
    envName: string,
  ): string {
    const fromDb = credentials?.[key];

    if (fromDb && String(fromDb).trim()) {
      return String(fromDb).trim();
    }

    const fromEnv = process.env[envName];

    if (fromEnv && fromEnv.trim()) {
      return fromEnv.trim();
    }

    throw new InternalServerErrorException(
      `Falta configurar ${key} para Zoom.`,
    );
  }

  private async getAccessToken(credentials?: Record<string, any>): Promise<string> {
    const accountId = this.getRequiredValue(
      credentials,
      'accountId',
      'ZOOM_ACCOUNT_ID',
    );

    const clientId = this.getRequiredValue(
      credentials,
      'clientId',
      'ZOOM_CLIENT_ID',
    );

    const clientSecret = this.getRequiredValue(
      credentials,
      'clientSecret',
      'ZOOM_CLIENT_SECRET',
    );

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const url =
      `${this.tokenUrl}?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.access_token) {
      throw new InternalServerErrorException(
        data?.reason ||
          data?.message ||
          'No se pudo obtener access token de Zoom',
      );
    }

    return data.access_token as string;
  }

  async createMeeting(
    input: CreateMeetingInput,
  ): Promise<CreateMeetingResult> {
    const accessToken = await this.getAccessToken(input.credentials);
    const zoomUser = this.getRequiredValue(
      input.credentials,
      'userIdOrEmail',
      'ZOOM_USER_ID_OR_EMAIL',
    );

    const fechaInicio = new Date(input.fechaInicioIso);
    const fechaFin = new Date(input.fechaFinIso);
    const duracionMinutos = Math.max(
      1,
      Math.round((fechaFin.getTime() - fechaInicio.getTime()) / 60000),
    );

    const response = await fetch(
      `${this.apiBaseUrl}/users/${encodeURIComponent(zoomUser)}/meetings`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: input.titulo,
          agenda: input.descripcion || '',
          type: 2,
          start_time: input.fechaInicioIso,
          duration: duracionMinutos,
          timezone: 'America/Lima',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            waiting_room: true,
            auto_recording: 'none',
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new InternalServerErrorException(
        data?.message || 'No se pudo crear la reunión en Zoom',
      );
    }

    return {
      provider: 'zoom',
      externalMeetingId: data?.id ? String(data.id) : null,
      joinUrl: data?.join_url || '',
      hostUrl: data?.start_url || null,
      metadata: data,
    };
  }
}