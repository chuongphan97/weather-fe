import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class DomainInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Prepend domain into request url
        const correctUrl = 'https:///weather-onion-app.herokuapp.com/' + req.url;
        // const correctUrl = 'http://localhost:8080/' + req.url;

        req = req.clone({
            url: correctUrl
        })

        return next.handle(req);
    }
}
