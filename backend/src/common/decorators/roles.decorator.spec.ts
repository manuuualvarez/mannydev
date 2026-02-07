/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method */
import 'reflect-metadata';
import { Roles, ROLES_KEY } from './roles.decorator';

describe('Roles decorator', () => {
  it('should set metadata with a single role', () => {
    @Roles('admin')
    class TestClass {}

    const roles = Reflect.getMetadata(ROLES_KEY, TestClass);
    expect(roles).toEqual(['admin']);
  });

  it('should set metadata with multiple roles', () => {
    @Roles('admin', 'super_admin')
    class TestClassMultiple {}

    const roles = Reflect.getMetadata(ROLES_KEY, TestClassMultiple);
    expect(roles).toEqual(['admin', 'super_admin']);
  });

  it('should set empty array when no roles provided', () => {
    @Roles()
    class TestClassEmpty {}

    const roles = Reflect.getMetadata(ROLES_KEY, TestClassEmpty);
    expect(roles).toEqual([]);
  });

  it('should work on methods', () => {
    class TestClassMethod {
      @Roles('admin')
      testMethod() {}
    }

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestClassMethod.prototype.testMethod,
    );
    expect(roles).toEqual(['admin']);
  });
});
