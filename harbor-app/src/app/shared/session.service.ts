import { Injectable } from '@angular/core';
import { Headers, Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { SessionUser } from './session-user';
import { SignInCredential } from './sign-in-credential';

const urlPrefix = '';
const signInUrl = urlPrefix + '/login';
const currentUserEndpint = urlPrefix + "/api/users/current";
const signOffEndpoint = urlPrefix + "/log_out";
const accountEndpoint = urlPrefix + "/api/users/:id";

/**
 * Define related methods to handle account and session corresponding things
 * 
 * @export
 * @class SessionService
 */
@Injectable()
export class SessionService {
    currentUser: SessionUser = null;

    private headers = new Headers({
        "Content-Type": 'application/json'
    });

    private formHeaders = new Headers({
        "Content-Type": 'application/x-www-form-urlencoded'
    });

    constructor(private http: Http) {}

    //Handle the related exceptions
    private handleError(error: any): Promise<any>{
        return Promise.reject(error.message || error);
    }

    //Submit signin form to backend (NOT restful service)
    signIn(signInCredential: SignInCredential): Promise<any>{
        //Build the form package
        const body = new URLSearchParams();
        body.set('principal', signInCredential.principal);
        body.set('password', signInCredential.password);

        //Trigger Http
        return this.http.post(signInUrl, body.toString(), { headers: this.formHeaders })
        .toPromise()
        .then(()=>null)
        .catch(error => this.handleError(error));
    }

    /**
     * Get the related information of current signed in user from backend
     * 
     * @returns {Promise<SessionUser>}
     * 
     * @memberOf SessionService
     */
    retrieveUser(): Promise<SessionUser> {
        return this.http.get(currentUserEndpint, { headers: this.headers }).toPromise()
            .then(response => {
                this.currentUser = response.json() as SessionUser;
                return this.currentUser;
            })
            .catch(error => this.handleError(error))
    }

    /**
     * For getting info
     */
    getCurrentUser(): SessionUser {
        return this.currentUser;
    }

    /**
     * Log out the system
     */
    signOff(): Promise<any> {
        return this.http.get(signOffEndpoint, { headers: this.headers }).toPromise()
        .then(() => {
            //Destroy current session cache
            this.currentUser = null;
        }) //Nothing returned
        .catch(error => this.handleError(error))
    }

    /**
     * 
     * Update accpunt settings
     * 
     * @param {SessionUser} account
     * @returns {Promise<any>}
     * 
     * @memberOf SessionService
     */
    updateAccountSettings(account: SessionUser): Promise<any>{
        if(!account){
            return Promise.reject("Invalid account settings");
        }
        let putUrl = accountEndpoint.replace(":id", account.user_id+"");
        return this.http.put(putUrl, JSON.stringify(account), { headers: this.headers }).toPromise()
        .then(() => {
            //Retrieve current session user
            return this.retrieveUser();
        })
        .catch(error => this.handleError(error))
    }
}