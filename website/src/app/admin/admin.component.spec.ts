import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AdminComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a navbar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav.navbar')).toBeTruthy();
  });

  it('should have a brand link with logo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const brand = compiled.querySelector('.navbar-brand');
    expect(brand).toBeTruthy();
    expect(brand?.textContent).toContain('Suhradam Yuvak Mandal');
  });

  it('should have a brand logo image', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('.navbar-brand img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('alt')).toBe('Logo');
  });

  it('should have navigation links for Registerations and Dashboard', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('.nav-link');
    expect(navLinks.length).toBe(2);

    const linkTexts = Array.from(navLinks).map(link => link.textContent?.trim());
    expect(linkTexts).toContain('Registerations');
    expect(linkTexts).toContain('Dashboard');
  });

  it('should have a router-outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should have a navbar toggler button for mobile', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const toggler = compiled.querySelector('.navbar-toggler');
    expect(toggler).toBeTruthy();
  });

  it('should have routerLink attributes on nav links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const regsLink = compiled.querySelector('a[routerLink="registerations"]');
    const dashLink = compiled.querySelector('a[routerLink="dashboard"]');
    expect(regsLink).toBeTruthy();
    expect(dashLink).toBeTruthy();
  });
});
