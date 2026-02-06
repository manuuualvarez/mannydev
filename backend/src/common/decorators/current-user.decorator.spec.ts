import { CurrentUser } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  it('should be a valid decorator factory', () => {
    expect(typeof CurrentUser).toBe('function');
  });

  it('should return a function when called', () => {
    const decorator = CurrentUser();
    expect(typeof decorator).toBe('function');
  });
});
