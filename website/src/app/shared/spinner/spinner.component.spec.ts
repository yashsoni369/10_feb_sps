import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpinnerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render loading text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading')).toBeTruthy();
    expect(compiled.querySelector('.loading')?.textContent).toContain('Loading');
  });

  it('should have a div with class "loading"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const loadingDiv = compiled.querySelector('div.loading');
    expect(loadingDiv).toBeTruthy();
  });

  it('should use app-spinner selector', () => {
    expect(fixture.nativeElement.tagName.toLowerCase()).toBe('app-spinner');
  });
});
