import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonar la petición y agregar withCredentials
  const authReq = req.clone({
    withCredentials: true
  });
  return next(authReq);
};