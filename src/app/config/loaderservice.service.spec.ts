import { TestBed } from '@angular/core/testing';

import { LoaderserviceService } from './loaderservice.service';

describe('LoaderserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoaderserviceService = TestBed.get(LoaderserviceService);
    expect(service).toBeTruthy();
  });
});
