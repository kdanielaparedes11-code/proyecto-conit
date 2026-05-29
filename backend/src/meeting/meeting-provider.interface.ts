export type MeetingProvider = 'google' | 'zoom' | 'teams';

export type MeetingAccessType = 'OPEN' | 'TRUSTED' | 'RESTRICTED';

export interface CreateMeetingInput {
  titulo: string;
  descripcion?: string;
  fechaInicioIso: string;
  fechaFinIso: string;
  accessType?: MeetingAccessType;
  attendees?: string[];

  credentials?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface CreateMeetingResult {
  provider: MeetingProvider;
  externalMeetingId?: string | null;
  joinUrl: string;
  hostUrl?: string | null;
  metadata?: any;
  accessType?: MeetingAccessType;
  attendees?: string[];
}

export interface IMeetingProviderService {
  createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult>;
}