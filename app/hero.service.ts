import {Injectable} from 'angular2/core';
//import {HEROES} from './mock-heroes';
import {Http, Response} from 'angular2/http';
import {Observable}     from 'rxjs/Observable';
import {Headers, RequestOptions, RequestOptionsArgs} from 'angular2/http';

import {Hero}       from './hero';
import { Settings } from './settings';

@Injectable()
export class HeroService {
    private _heroesUrl = 'app/heroes';  // URL to web api
    private _verbose : boolean;

    constructor(private _http: Http, private _settings: Settings){
        this._verbose = _settings.verbose;
    }

    getHeroes() : Observable<Hero[]> {
        return this._http.get(this._heroesUrl)
                .map(res => <Hero[]> res.json().data)
                .do(data => { if (this._verbose) console.log(data) }) // eyeball results in the console
                .catch(this.handleError);
    }
  
    addHero (name: string, rating: number) : Observable<Hero>  {
        let body = JSON.stringify({ name: name, rating: rating });
        
        if (this._verbose) console.log('Adding hero ' + name + '...');

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this._http.post(this._heroesUrl, body, options)
                    .map(res =>  <Hero> res.json().data)
                    .catch(this.handleError)
    }
    
    updateHero (hero: Hero) : Observable<void> {
        let putUrl = this._heroesUrl + '/' + hero.id;
        let body = JSON.stringify({ id: hero.id, name: hero.name, rating: hero.rating });

        if (this._verbose) console.log(putUrl + '; ' + 'body=' + body);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
    
        return this._http.put(putUrl, body, options)
                    .map(res => {})
                    .catch(this.handleError)
    }
    
    deleteHero(hero: Hero): Observable<void>{
        let deleteUrl = this._heroesUrl + '/' + hero.id;
        
        if (this._verbose) console.log('delete: ' + deleteUrl);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this._http.delete(deleteUrl, options)
                    .map(response => {})
                    .catch(this.handleError);
    }
    
    private handleError (error: Response) : Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}

