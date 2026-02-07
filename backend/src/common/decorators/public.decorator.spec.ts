/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Public, IS_PUBLIC_KEY } from './public.decorator';

describe('Public Decorator', () => {
  it('should export IS_PUBLIC_KEY constant', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });

  it('should be a valid decorator function', () => {
    expect(typeof Public).toBe('function');
  });

  it('should set metadata correctly when applied', () => {
    // Test that the decorator sets the correct metadata
    @Public()
    class TestClass {
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestClass);
    expect(metadata).toBe(true);
  });
});
