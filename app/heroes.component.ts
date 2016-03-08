import { Component } from 'angular2/core';
import { OnInit, AfterViewInit, AfterViewChecked } from 'angular2/core';
import { Router } from 'angular2/router';

import { Hero } from './hero';
import { HeroDetailComponent } from './hero-detail.component';
import { HeroService } from './hero.service';
import { RatingComponent } from './rating.component';
import { Settings } from './settings';

@Component({
    selector: 'my-heroes',
    templateUrl: 'app/heroes.component.html',
    styleUrls:['app/heroes.component.css'],
    directives: [RatingComponent],
    providers: [],
    //inputs: ['rating']
})
export class HeroesComponent implements OnInit, AfterViewInit, AfterViewChecked { 
    public heroes: Hero[];
    public selectedHero: Hero;
    private isAfterViewInit = false;
    private isAfterViewChecked = false;
    private _verbose : boolean;
    
    constructor(
        private _heroService: HeroService, 
        private _router: Router,
        private _settings: Settings) {
            this._verbose = _settings.verbose;
    }
    
    ngOnInit() {
        this._heroService.getHeroes()
        .subscribe(
            heroes => this.heroes = heroes.sort((a, b) => { return (a.name <= b.name) ? -1 : 1 }), 
            e => console.log(e)
        );
    }
    
    ngAfterViewInit() {
        this.isAfterViewInit = true;
    }
    
    ngAfterViewChecked() {
        this.isAfterViewChecked = true;
    }
    
    onSelect(h: Hero) {
        if (this._verbose) console.log('Select ' + h.name + ', who has rating ' + ((typeof(h.rating) === "undefined") ? '?' : h.rating));
        this.selectedHero = h;
    }
    
    gotoDetail(){
        if (!this.selectedHero) return;
        let link = [ 'HeroDetail', {"id": this.selectedHero.id}]
        this._router.navigate(link);
    }
    
    onDeselect() {
        this.selectedHero = undefined;
    }
    
    addHero(name: string) {
        this._heroService.addHero(name, 0)
            //.do(x => console.log(x))
        .subscribe(
            hero  => this.heroes.push(hero),
            //error =>  this.errorMessage = <any>error);
            error => console.log(error)
        );
    }
    
    onChangeRating(hero: Hero, rating: number){
        if (this.isAfterViewChecked) {
            if (hero.rating != rating) {
                if (this._verbose) console.log('Update hero "' + hero.name + '" after change rating to ' + rating);
                hero.rating = rating;
                this._heroService.updateHero(hero)
                .subscribe(
                    hero => {},
                    error => console.error(error)
                );
            }
        }
    }
    
    delete(hero:Hero){
        this._heroService.deleteHero(hero)
        .subscribe(
            resp => this._removeHeroFromList(hero),
            error => console.error(error)
        );
    }
    
    _removeHeroFromList(hero) {
        if (hero == this.selectedHero) {
            this.selectedHero = null;
        }
        let idx = this.heroes.indexOf(hero);
        this.heroes.splice(idx, 1);
    }
    
}
