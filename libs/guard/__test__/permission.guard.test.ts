import { HttpException, HttpStatus } from '@nestjs/common';
import { PermissionGuard } from '../permission.guard';
import { Operator, PermissionExpr } from '@app/decorator';

describe('PermissionGuard', () => {
  let permissionGuard: PermissionGuard;
  let reflectorMock: any;
  let permissionServiceMock: any;

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    };
    permissionServiceMock = {
      getAccountPermission: jest.fn(),
    };
    permissionGuard = new PermissionGuard(reflectorMock, permissionServiceMock);
  });

  it('should return true if no required permissions are defined', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);
    const contextMock: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };

    const result = await permissionGuard.canActivate(contextMock);

    expect(result).toBe(true);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalled();
  });

  it('should return true if required permissions are an empty array', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue([]);
    const contextMock: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };

    const result = await permissionGuard.canActivate(contextMock);

    expect(result).toBe(true);
  });

  it('should throw HttpException if user permissions are insufficient', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue([
      'permission1',
      'permission2',
    ]);
    permissionServiceMock.getAccountPermission.mockResolvedValue([
      'permission1',
    ]);
    const contextMock: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: '1' },
        }),
      }),
    };

    await expect(permissionGuard.canActivate(contextMock)).rejects.toThrow(
      new HttpException('权限不足', HttpStatus.FORBIDDEN),
    );
  });

  it('should return true if user has all required permissions', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue([
      'permission1',
      'permission2',
    ]);
    permissionServiceMock.getAccountPermission.mockResolvedValue([
      'permission1',
      'permission2',
    ]);
    const contextMock: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: '1' },
        }),
      }),
    };

    const result = await permissionGuard.canActivate(contextMock);

    expect(result).toBe(true);
  });

  it('should evaluate complex permission expressions correctly', async () => {
    const permissionExpr = {
      op: Operator.AND,
      lhs: { op: Operator.HAS, expr: 'permission1' },
      rhs: {
        op: Operator.NOT,
        expr: { op: Operator.HAS, expr: 'permission2' },
      },
    };
    reflectorMock.getAllAndOverride.mockReturnValue(permissionExpr);
    permissionServiceMock.getAccountPermission.mockResolvedValue([
      'permission1',
    ]);
    const contextMock: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: '1' },
        }),
      }),
    };

    const result = await permissionGuard.canActivate(contextMock);

    expect(result).toBe(true);
  });

  it('should throw HttpException if complex permission expressions fail', async () => {
    const permissionExpr = {
      op: Operator.AND,
      lhs: { op: Operator.HAS, expr: 'permission1' },
      rhs: { op: Operator.HAS, expr: 'permission2' },
    };
    reflectorMock.getAllAndOverride.mockReturnValue(permissionExpr);
    permissionServiceMock.getAccountPermission.mockResolvedValue([
      'permission1',
    ]);
    const contextMock: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: '1' },
        }),
      }),
    };

    await expect(permissionGuard.canActivate(contextMock)).rejects.toThrow(
      new HttpException('权限不足', HttpStatus.FORBIDDEN),
    );
  });
  it('should return true for boolean node', () => {
    const result = permissionGuard.judge([], true);
    expect(result).toBe(true);
  });

  it('should return false for NOT operator with true expression', () => {
    const node: PermissionExpr = { op: Operator.NOT, expr: true };
    const result = permissionGuard.judge([], node);
    expect(result).toBe(false);
  });

  it('should return true for HAS operator when permission exists', () => {
    const node: PermissionExpr = { op: Operator.HAS, expr: 'permission1' };
    const result = permissionGuard.judge(['permission1'], node);
    expect(result).toBe(true);
  });

  it('should return false for HAS operator when permission does not exist', () => {
    const node: PermissionExpr = { op: Operator.HAS, expr: 'permission1' };
    const result = permissionGuard.judge(['permission2'], node);
    expect(result).toBe(false);
  });

  it('should return true for SOME operator when at least one permission matches', () => {
    const node: PermissionExpr = {
      op: Operator.SOME,
      expr: ['permission1', 'permission2'],
    };
    const result = permissionGuard.judge(['permission2'], node);
    expect(result).toBe(true);
  });

  it('should return false for SOME operator when no permissions match', () => {
    const node: PermissionExpr = {
      op: Operator.SOME,
      expr: ['permission1', 'permission2'],
    };
    const result = permissionGuard.judge(['permission3'], node);
    expect(result).toBe(false);
  });

  it('should return false for EVERY operator when not all permissions match', () => {
    const node: PermissionExpr = {
      op: Operator.EVERY,
      expr: ['permission1', 'permission2'],
    };
    const result = permissionGuard.judge(
      ['permission1', 'permission2', 'permission3'],
      node,
    );
    expect(result).toBe(false);
  });

  it('should return true for EVERY operator when all permissions match', () => {
    const node: PermissionExpr = {
      op: Operator.EVERY,
      expr: ['permission1', 'permission2'],
    };
    const result = permissionGuard.judge(['permission1', 'permission2'], node);
    expect(result).toBe(true);
  });

  it('should return true for AND operator when both sides are true', () => {
    const node: PermissionExpr = {
      op: Operator.AND,
      lhs: { op: Operator.HAS, expr: 'permission1' },
      rhs: { op: Operator.HAS, expr: 'permission2' },
    };
    const result = permissionGuard.judge(['permission1', 'permission2'], node);
    expect(result).toBe(true);
  });

  it('should return false for AND operator when one side is false', () => {
    const node: PermissionExpr = {
      op: Operator.AND,
      lhs: { op: Operator.HAS, expr: 'permission1' },
      rhs: { op: Operator.HAS, expr: 'permission2' },
    };
    const result = permissionGuard.judge(['permission1'], node);
    expect(result).toBe(false);
  });

  it('should return true for OR operator when one side is true', () => {
    const node: PermissionExpr = {
      op: Operator.OR,
      lhs: { op: Operator.HAS, expr: 'permission1' },
      rhs: { op: Operator.HAS, expr: 'permission2' },
    };
    const result = permissionGuard.judge(['permission1'], node);
    expect(result).toBe(true);
  });

  it('should return false for OR operator when both sides are false', () => {
    const node: PermissionExpr = {
      op: Operator.OR,
      lhs: { op: Operator.HAS, expr: 'permission1' },
      rhs: { op: Operator.HAS, expr: 'permission2' },
    };
    const result = permissionGuard.judge(['permission3'], node);
    expect(result).toBe(false);
  });
});
