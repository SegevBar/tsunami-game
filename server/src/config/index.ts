export const config = {
  port: process.env.PORT || 3001,
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
    ] as string[],
    methods: ['GET', 'POST'] as string[],
  },
};

