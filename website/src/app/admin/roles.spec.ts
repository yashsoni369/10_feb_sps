import { users } from './roles';

describe('Roles', () => {
  it('should be defined', () => {
    expect(users).toBeDefined();
  });

  it('should be an array', () => {
    expect(Array.isArray(users)).toBeTruthy();
  });

  it('should have at least one user', () => {
    expect(users.length).toBeGreaterThan(0);
  });

  it('should have users with emailId, password, and role properties', () => {
    users.forEach(user => {
      expect(user.emailId).toBeDefined();
      expect(user.password).toBeDefined();
      expect(user.role).toBeDefined();
    });
  });

  it('should have unique emailIds', () => {
    const emailIds = users.map(u => u.emailId);
    const uniqueEmailIds = new Set(emailIds);
    expect(uniqueEmailIds.size).toBe(emailIds.length);
  });

  it('should have super admin user', () => {
    const superAdmin = users.find(u => u.role === 'super');
    expect(superAdmin).toBeTruthy();
    expect(superAdmin.emailId).toBe('vaibhav@hpym.com');
  });

  it('should have all emailIds ending with @hpym.com', () => {
    users.forEach(user => {
      expect(user.emailId).toMatch(/@hpym\.com$/);
    });
  });

  it('should have non-empty passwords for all users', () => {
    users.forEach(user => {
      expect(user.password.length).toBeGreaterThan(0);
    });
  });

  it('should have non-empty roles for all users', () => {
    users.forEach(user => {
      expect(user.role.length).toBeGreaterThan(0);
    });
  });

  it('should contain yuvati users', () => {
    const yuvatiUsers = users.filter(u => u.emailId.includes('yuvati'));
    expect(yuvatiUsers.length).toBeGreaterThan(0);
  });

  it('should contain mandal users (non-yuvati, non-super)', () => {
    const mandalUsers = users.filter(u => !u.emailId.includes('yuvati') && u.role !== 'super');
    expect(mandalUsers.length).toBeGreaterThan(0);
  });

  it('should have Asalpha mandal user', () => {
    const asalpha = users.find(u => u.role === 'Asalpha');
    expect(asalpha).toBeTruthy();
  });

  it('should have Kurla mandal user', () => {
    const kurla = users.find(u => u.role === 'Kurla');
    expect(kurla).toBeTruthy();
  });

  it('should have Thane mandal user', () => {
    const thane = users.find(u => u.role === 'Thane');
    expect(thane).toBeTruthy();
  });

  it('should have Mulund mandal user', () => {
    const mulund = users.find(u => u.role === 'Mulund');
    expect(mulund).toBeTruthy();
  });

  it('should have yuvati roles containing (Yuvati)', () => {
    const yuvatiUsers = users.filter(u => u.emailId.includes('yuvati'));
    yuvatiUsers.forEach(u => {
      expect(u.role).toContain('(Yuvati)');
    });
  });
});
