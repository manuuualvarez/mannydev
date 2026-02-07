/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Application (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('should return OK on health check query', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: '{ health }',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.health).toBe('OK');
        });
    });
  });

  describe('GraphQL', () => {
    it('should respond to introspection query', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            {
              __schema {
                types {
                  name
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.__schema).toBeDefined();
          expect(res.body.data.__schema.types).toBeInstanceOf(Array);
        });
    });
  });

  describe('Services (Public Queries)', () => {
    it('should allow query services without auth', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: '{ services { id name slug } }',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.services).toBeInstanceOf(Array);
        });
    });

    it('should reject createService mutation without auth', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createService(input: {
                name: "Test Service",
                slug: "test-service",
                description: "A test service description"
              }) {
                id
                name
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toMatch(
            /Unauthorized|No authorization header/,
          );
        });
    });
  });

  describe('Blog Posts (Public Queries)', () => {
    it('should allow query blogPosts without auth', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: '{ blogPosts { id title slug } }',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.blogPosts).toBeInstanceOf(Array);
        });
    });

    it('should reject createBlogPost mutation without auth', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createBlogPost(input: {
                title: "Test Post",
                slug: "test-post",
                content: "This is test content for the blog post"
              }) {
                id
                title
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toMatch(
            /Unauthorized|No authorization header/,
          );
        });
    });
  });

  describe('Leads', () => {
    it('should allow createLead without auth (contact form)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createLead(input: {
                name: "Test User",
                email: "test@example.com",
                message: "This is a test message for the contact form"
              }) {
                id
                name
                email
                status
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          if (res.body.errors) {
            // If database is not available, we expect a different error
            expect(res.body.errors[0].message).not.toContain('Unauthorized');
          } else {
            expect(res.body.data.createLead).toBeDefined();
            expect(res.body.data.createLead.status).toBe('NEW');
          }
        });
    });

    it('should reject leads query without auth', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: '{ leads { id name email } }',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toMatch(
            /Unauthorized|No authorization header/,
          );
        });
    });

    it('should validate email format in createLead', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createLead(input: {
                name: "Test User",
                email: "invalid-email",
                message: "This is a test message"
              }) {
                id
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
        });
    });
  });
});
