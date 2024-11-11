import { TestBed } from '@automock/jest';
import { CustomAuthGuard } from '../guard/customAuth.guard';
import { CommonService } from '../common.service';
import { createMockExecutionContext, mockToken, mockUserId } from './test.mockdata';
import { Public } from '../decorator/public.decorator';

describe('CustomAuthGuard', () => {
  let customAuthGuard: CustomAuthGuard;
  let commonService: jest.Mocked<CommonService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(CustomAuthGuard).compile();

    customAuthGuard = unit;
    commonService = unitRef.get<CommonService>(CommonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    const mockReq: any = {};
    const mockExecutionContext = createMockExecutionContext(mockReq);

    it.each(['refresh', undefined])(
      `Public 데코값이 %s, 토큰과 타입 가져와서 검증, req에 user 넣기, return true`,
      async (mockReturnValue) => {
        const isRefresh = mockReturnValue === 'refresh';

        jest.spyOn(commonService, 'getMetaData').mockReturnValue(mockReturnValue);
        jest.spyOn(commonService, 'getToken').mockReturnValue(mockToken);
        jest.spyOn(commonService, 'validateToken').mockImplementation(({ req }) => {
          req.user = { userId: mockUserId };
          return Promise.resolve(true);
        });

        const result = await customAuthGuard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
        expect(commonService.getMetaData).toHaveBeenCalledWith({
          decorator: Public,
          context: mockExecutionContext,
        });
        expect(commonService.getToken).toHaveBeenCalledWith({
          isRefresh,
          req: mockReq,
        });
        expect(commonService.validateToken).toHaveBeenCalledWith({
          isRefresh,
          token: mockToken,
          req: mockReq,
        });
        expect(mockReq.user).toEqual({ userId: mockUserId });
      },
    );

    it('Public 데코가 있고 refresh가 아닌 경우, return true', async () => {
      jest.spyOn(commonService, 'getMetaData').mockReturnValue({});

      const result = await customAuthGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(commonService.getMetaData).toHaveBeenCalledWith({
        decorator: Public,
        context: mockExecutionContext,
      });
      expect(commonService.getToken).not.toHaveBeenCalled();
    });

    it.each(['refresh', undefined])(
      'token이 boolean인 경우 = 토큰이 잘못된 경우, return false',
      async (mockReturnValue) => {
        const isRefresh = mockReturnValue === 'refresh';

        jest.spyOn(commonService, 'getMetaData').mockReturnValue(mockReturnValue);
        jest.spyOn(commonService, 'getToken').mockReturnValue(false);

        const result = await customAuthGuard.canActivate(mockExecutionContext);

        expect(result).toBe(false);
        expect(commonService.getMetaData).toHaveBeenCalledWith({
          decorator: Public,
          context: mockExecutionContext,
        });
        expect(commonService.getToken).toHaveBeenCalledWith({ isRefresh, req: mockReq });
        expect(commonService.validateToken).not.toHaveBeenCalled();
      },
    );
  });
});
