import { Component, OnInit } from 'angular2/core';
import { Hero } from './hero';
import { HeroService } from './hero.service';
import { Router } from 'angular2/router';

@Component({
  selector: 'my-dashboard',
  templateUrl: 'app/dashboard.component.html',
  styleUrls: ['app/dashboard.component.css']
})
export class DashboardComponent implements OnInit { 
    heroes: Hero[];
    errorMessage: string;
    
    constructor(
        private _heroService: HeroService,
        private _router: Router) {
            //alert('ctor DashboardComponent');
    }
    
    gotoDetail(hero: Hero){
        let link = ['HeroDetail', { id: hero.id }];
        this._router.navigate(link);
    }
    
    ngOnInit() {
        this._heroService.getHeroes()
        .subscribe(heroes =>  this.heroes = heroes.sort((a,b) => (a.rating < b.rating)?1:-1).slice(0,4),
                   error => this.errorMessage= <any>error);
        //.then( heroes =>  this.heroes = heroes.slice(1,5) );
    }
}
