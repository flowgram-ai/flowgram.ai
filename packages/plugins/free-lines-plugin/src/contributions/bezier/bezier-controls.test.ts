import { describe, expect, it } from 'vitest';
import { IPoint } from '@flowgram.ai/utils';

import {
  getBezierHorizontalControlPoints,
  getBezierVerticalControlPoints,
} from './bezier-controls';

describe('Bezier Control Points', () => {
  describe('getBezierHorizontalControlPoints', () => {
    it('should handle RIGHT_BOTTOM case', () => {
      const from: IPoint = { x: 0, y: 0 };
      const to: IPoint = { x: 100, y: 100 };
      const result = getBezierHorizontalControlPoints(from, to);
      expect(result).toEqual([
        { x: 50, y: 0 },
        { x: 50, y: 100 },
      ]);
    });

    it('should handle RIGHT_TOP case', () => {
      const from: IPoint = { x: 0, y: 100 };
      const to: IPoint = { x: 100, y: 0 };
      const result = getBezierHorizontalControlPoints(from, to);
      expect(result).toEqual([
        { x: 50, y: 100 },
        { x: 50, y: 0 },
      ]);
    });

    it('should handle LEFT_BOTTOM case', () => {
      const from: IPoint = { x: 100, y: 0 };
      const to: IPoint = { x: 0, y: 100 };
      const result = getBezierHorizontalControlPoints(from, to);
      expect(result).toEqual([
        { x: 200, y: 0 },
        { x: -100, y: 100 },
      ]);
    });

    it('should handle LEFT_TOP case', () => {
      const from: IPoint = { x: 100, y: 100 };
      const to: IPoint = { x: 0, y: 0 };
      const result = getBezierHorizontalControlPoints(from, to);
      expect(result).toEqual([
        { x: 200, y: 100 },
        { x: -100, y: 0 },
      ]);
    });

    it('should handle CONTROL_MAX limit', () => {
      const from: IPoint = { x: 1000, y: 0 };
      const to: IPoint = { x: 0, y: 100 };
      const result = getBezierHorizontalControlPoints(from, to);
      expect(result).toEqual([
        { x: 1300, y: 0 },
        { x: -300, y: 100 },
      ]);
    });
  });

  describe('getBezierVerticalControlPoints', () => {
    it('should handle RIGHT_BOTTOM case', () => {
      const from: IPoint = { x: 0, y: 0 };
      const to: IPoint = { x: 100, y: 100 };
      const result = getBezierVerticalControlPoints(from, to);
      expect(result).toEqual([
        { x: 0, y: 50 },
        { x: 100, y: 50 },
      ]);
    });

    it('should handle LEFT_BOTTOM case', () => {
      const from: IPoint = { x: 100, y: 0 };
      const to: IPoint = { x: 0, y: 100 };
      const result = getBezierVerticalControlPoints(from, to);
      expect(result).toEqual([
        { x: 100, y: 50 },
        { x: 0, y: 50 },
      ]);
    });

    it('should handle RIGHT_TOP case', () => {
      const from: IPoint = { x: 0, y: 100 };
      const to: IPoint = { x: 100, y: 0 };
      const result = getBezierVerticalControlPoints(from, to);
      expect(result).toEqual([
        { x: 0, y: 200 },
        { x: 100, y: -100 },
      ]);
    });

    it('should handle LEFT_TOP case', () => {
      const from: IPoint = { x: 100, y: 100 };
      const to: IPoint = { x: 0, y: 0 };
      const result = getBezierVerticalControlPoints(from, to);
      expect(result).toEqual([
        { x: 100, y: 200 },
        { x: 0, y: -100 },
      ]);
    });

    it('should handle CONTROL_MAX limit', () => {
      const from: IPoint = { x: 0, y: 1000 };
      const to: IPoint = { x: 100, y: 0 };
      const result = getBezierVerticalControlPoints(from, to);
      expect(result).toEqual([
        { x: 0, y: 1300 },
        { x: 100, y: -300 },
      ]);
    });
  });
});
