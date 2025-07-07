export interface Config {
  telegram: {
    botToken: string;
    chatId: number;
    threadId: number;
  };
  database: {
    path: string;
  };
  scraper: {
    url: string;
    intervalMinutes: number;
  };
  filters: Filter[];
}

export interface Filter {
  name: string;
  url: string;
  telegramChatId: string;
  telegramThreadId: number;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  url: string;
  imageUrl?: string;
}
