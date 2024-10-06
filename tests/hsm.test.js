import hsm from '../dist/hsm.js';
import { expect } from 'chai';

describe('hsm', async () => {
  it('should be defined', () => {
    console.log(hsm);
    expect(hsm).to.be.ok;
  });
});
