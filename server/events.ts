import { Response } from 'express';

interface SSEClient {
  id: string;
  userId?: string;
  res: Response;
}

class EventBus {
  private clients: Map<string, SSEClient> = new Map();

  public addClient(id: string, res: Response, userId?: string) {
    this.clients.set(id, { id, userId, res });
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('retry: 3000\n\n');
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

    const interval = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 20000);

    res.on('close', () => {
      clearInterval(interval);
      this.clients.delete(id);
    });
  }

  public broadcast(eventType: string, payload: any) {
    const message = `data: ${JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() })}\n\n`;
    for (const [id, client] of this.clients.entries()) {
      try {
        client.res.write(message);
      } catch (err) {
        this.clients.delete(id);
      }
    }
  }

  public notifyUser(userId: string, eventType: string, payload: any) {
    const message = `data: ${JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() })}\n\n`;
    for (const [id, client] of this.clients.entries()) {
      if (!client.userId || client.userId === userId) {
        try {
          client.res.write(message);
        } catch (err) {
          this.clients.delete(id);
        }
      }
    }
  }
}

export const eventBus = new EventBus();
