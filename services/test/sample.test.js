import { describe, it, expect } from "vitest";
// import fs from 'fs';
import { formatDay } from '../functions/analyze';
import { d12 } from './2022-08-12';
import { d13 } from './2022-08-13';
import { d14 } from './2022-08-14';

describe("sample", () => {

  it("should work", async () => {
    // const d12 = fs.readFileSync('2022-08-12.json', 'utf-8');
    let times = {
      ...formatDay(d12),
      ...formatDay(d13),
      ...formatDay(d14)
    };
    console.log('-------------    12    -------------');
    console.dir(times['2022-08-12']['15:45'], { depth: null });
    console.log('-------------    13   -------------');
    console.dir(times['2022-08-13']['15:45'], { depth: null });
    console.log('-------------    14    -------------');
    console.dir(times['2022-08-14']['15:45'], { depth: null });


    expect(true).toBe(true);
  });
});
