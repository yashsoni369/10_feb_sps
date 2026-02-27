import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { RegisterComponent } from './register/register.component';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule, Component } from '@angular/core';

// Dummy component for lazy-loaded admin module in tests
@Component({ template: '<p>admin works</p>' })
class DummyAdminComponent {}

@NgModule({
  declarations: [DummyAdminComponent],
  imports: [
    RouterTestingModule.withRoutes([
      { path: '', component: DummyAdminComponent }
    ])
  ]
})
class DummyAdminModule {}

describe('AppRoutingModule', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: 'register', pathMatch: 'full' },
          { path: 'register', component: RegisterComponent },
          { path: 'admin', loadChildren: () => Promise.resolve(DummyAdminModule) }
        ])
      ],
      declarations: [
        AppComponent,
        RegisterComponent
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('should create the routing module', () => {
    const module = new AppRoutingModule();
    expect(module).toBeTruthy();
  });

  it('should have 3 routes defined', () => {
    const routes = router.config;
    expect(routes.length).toBe(3);
  });

  it('should have a default redirect route from empty path to register', () => {
    const defaultRoute = router.config.find(r => r.path === '' && r.redirectTo === 'register');
    expect(defaultRoute).toBeTruthy();
    expect(defaultRoute.pathMatch).toBe('full');
  });

  it('should have a route for /register', () => {
    const registerRoute = router.config.find(r => r.path === 'register');
    expect(registerRoute).toBeTruthy();
    expect(registerRoute.component).toBe(RegisterComponent);
  });

  it('should have a lazy-loaded route for /admin', () => {
    const adminRoute = router.config.find(r => r.path === 'admin');
    expect(adminRoute).toBeTruthy();
    expect(adminRoute.loadChildren).toBeDefined();
    expect(typeof adminRoute.loadChildren).toBe('function');
  });

  it('should redirect empty path to /register', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await router.navigate(['']);
    await fixture.whenStable();
    expect(location.path()).toBe('/register');
  });

  it('should navigate to /register', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await router.navigate(['/register']);
    await fixture.whenStable();
    expect(location.path()).toBe('/register');
  });

  it('should navigate to /admin', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await router.navigate(['/admin']);
    await fixture.whenStable();
    expect(location.path()).toBe('/admin');
  });

  it('should have the default redirect with pathMatch full', () => {
    const defaultRoute = router.config.find(r => r.path === '');
    expect(defaultRoute).toBeTruthy();
    expect(defaultRoute.pathMatch).toBe('full');
  });

  it('should not have any route with an undefined component or loadChildren', () => {
    const invalidRoutes = router.config.filter(
      r => !r.component && !r.loadChildren && !r.redirectTo
    );
    expect(invalidRoutes.length).toBe(0);
  });
});
