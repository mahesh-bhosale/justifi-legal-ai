import { Kafka, type Consumer, type KafkaConfig, logLevel, type Producer, type SASLOptions } from 'kafkajs';
import { randomUUID } from 'crypto';
import fs from 'fs';

type KafkaTopic =
  | 'case-events'
  | 'proposal-events'
  | 'message-events'
  | 'document-events'
  | 'notification-events';

export type BaseEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: string;
  eventType: string;
  timestamp: string;
  actorId: string;
  caseId: string;
  payload: TPayload;
};

export function buildEvent<TPayload extends Record<string, unknown>>(params: {
  eventType: string;
  actorId: string;
  caseId: string | number;
  payload: TPayload;
}): BaseEvent<TPayload> {
  return {
    eventId: randomUUID(),
    eventType: params.eventType,
    timestamp: new Date().toISOString(),
    actorId: params.actorId,
    caseId: String(params.caseId),
    payload: params.payload,
  };
}

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let consumer: Consumer | null = null;
let isConnected = false;

function loadSslOptions():
  | boolean
  | { rejectUnauthorized: boolean; ca?: string[]; cert?: string; key?: string } {
  const sslEnabled = process.env.KAFKA_SSL === 'true';
  if (!sslEnabled) return false;

  const caPath = process.env.KAFKA_SSL_CA_PATH;
  const certPath = process.env.KAFKA_SSL_CERT_PATH;
  const keyPath = process.env.KAFKA_SSL_KEY_PATH;

  if (caPath && fs.existsSync(caPath)) {
    const opts: { rejectUnauthorized: boolean; ca?: string[]; cert?: string; key?: string } = {
      rejectUnauthorized: true,
      ca: [fs.readFileSync(caPath, 'utf8')],
    };
    if (certPath && fs.existsSync(certPath)) {
      opts.cert = fs.readFileSync(certPath, 'utf8');
    }
    if (keyPath && fs.existsSync(keyPath)) {
      opts.key = fs.readFileSync(keyPath, 'utf8');
    }
    return opts;
  }

  // Aiven / managed Kafka: often works with TLS + SASL without local CA file in container
  console.warn('KAFKA_SSL=true but no readable KAFKA_SSL_CA_PATH — using rejectUnauthorized: false');
  return { rejectUnauthorized: false };
}

function getKafkaConfig(): KafkaConfig {
  const clientId = process.env.KAFKA_CLIENT_ID || 'justifi-legal-ai';
  const broker = process.env.KAFKA_BROKER || 'localhost:9092';

  const ssl = loadSslOptions();

  const saslMechanism = (process.env.KAFKA_SASL_MECHANISM || '').toLowerCase();
  const saslUsername = process.env.KAFKA_SASL_USERNAME;
  const saslPassword = process.env.KAFKA_SASL_PASSWORD;

  const maybeSasl: SASLOptions | undefined = (() => {
    if (process.env.KAFKA_SSL !== 'true' || !saslUsername || !saslPassword) return undefined;
    if (saslMechanism === 'plain') return { mechanism: 'plain', username: saslUsername, password: saslPassword };
    if (saslMechanism === 'scram-sha-256') {
      return { mechanism: 'scram-sha-256', username: saslUsername, password: saslPassword };
    }
    if (saslMechanism === 'scram-sha-512') {
      return { mechanism: 'scram-sha-512', username: saslUsername, password: saslPassword };
    }
    return { mechanism: 'plain', username: saslUsername, password: saslPassword };
  })();

  return {
    clientId,
    brokers: [broker],
    ssl,
    sasl: maybeSasl,
    logLevel: process.env.NODE_ENV === 'development' ? logLevel.INFO : logLevel.ERROR,
  };
}

export async function connectKafka(): Promise<void> {
  if (isConnected) {
    console.log('Kafka connected (already)');
    return;
  }

  try {
    kafka = new Kafka(getKafkaConfig());
    producer = kafka.producer();

    const groupId = process.env.KAFKA_GROUP_ID || 'justifi-backend-group';
    consumer = kafka.consumer({ groupId });

    await producer.connect();
    await consumer.connect();

    isConnected = true;
    console.log('Kafka connected');
  } catch (err) {
    console.error('Kafka connection failed:', err);
    isConnected = false;
    producer = null;
    consumer = null;
    kafka = null;
    throw err;
  }
}

export async function publishEvent(topic: KafkaTopic, event: BaseEvent): Promise<void> {
  if (!producer || !isConnected) {
    return;
  }

  const message = {
    topic,
    messages: [
      {
        key: event.caseId,
        value: JSON.stringify(event),
        headers: {
          eventType: event.eventType,
          eventId: event.eventId,
        },
      },
    ],
  };

  try {
    await producer.send(message);
  } catch (err) {
    console.error('Kafka publish failed:', err);
    try {
      await new Promise((r) => setTimeout(r, 750));
      await producer.send(message);
      console.log('Kafka publish succeeded on retry');
    } catch (err2) {
      console.error('Kafka publish failed (retry):', err2);
    }
  }
}

export function getKafkaConsumer(): Consumer | null {
  return consumer;
}

export async function startConsumers(): Promise<void> {
  const { startMessageEventsConsumer } = await import('./message-events.consumer');
  await startMessageEventsConsumer();
}
