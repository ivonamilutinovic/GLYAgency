import { TestBed } from '@angular/core/testing';

import { AuthGuardAgent, AuthGuardUser } from './auth.guard';

describe('AuthGuardAgent', () => {
  let guard: AuthGuardAgent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuardAgent);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

describe('AuthGuardUser', () => {
  let guard: AuthGuardUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuardUser);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

