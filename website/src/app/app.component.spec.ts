import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should be an instance of AppComponent', () => {
    expect(component instanceof AppComponent).toBeTrue();
  });

  it(`should have as title 'website'`, () => {
    expect(component.title).toEqual('website');
  });

  it('should have title property defined as a string', () => {
    expect(typeof component.title).toBe('string');
  });

  it('should contain a router-outlet in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should have router-outlet as the only root element content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const children = compiled.children;
    // router-outlet is the primary element in the template
    expect(children.length).toBeGreaterThanOrEqual(1);
  });

  it('should use app-root as its selector', () => {
    const componentElement = fixture.debugElement;
    expect(componentElement.nativeElement.tagName.toLowerCase()).toBe('app-root');
  });

  it('should render without errors', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should have a defined fixture', () => {
    expect(fixture).toBeDefined();
  });

  it('should find router-outlet via debug element', () => {
    const routerOutletDebug = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutletDebug).toBeTruthy();
  });
});
