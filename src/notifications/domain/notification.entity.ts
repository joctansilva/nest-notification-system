// entidade dominio, representa um evento de notificação

export class Notification {
  //Tipo do evento
  readonly event: string;

  //Destinatário
  readonly recipientEmail: string;

  //Dados extras que o worker utilizará para montar o email
  readonly payload: Record<string, unknown>;

  //Data criação
  readonly createdAt: Date;

  constructor(params: {
    event: string;
    recipientEmail: string;
    payload: Record<string, unknown>;
  }) {
    if (!params.recipientEmail.includes('@')) {
      throw new Error('E-mail inválido');
    }

    if (!params.event) {
      throw new Error('Evento não pode ser vazio');
    }

    this.event = params.event;
    this.recipientEmail = params.recipientEmail;
    this.payload = params.payload;
    this.createdAt = new Date();
  }
}
