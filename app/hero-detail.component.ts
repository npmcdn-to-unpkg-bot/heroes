import { Component, OnInit } from 'angular2/core';
import { Hero } from './hero';
import { RouteParams } from 'angular2/router';
import { HeroService } from './hero.service';
import { RatingComponent } from './rating.component';

@Component({
  selector: 'my-hero-detail',
  templateUrl: 'app/hero-detail.component.html',
  styleUrls: ['app/hero-detail.component.css'],
  inputs: ['hero'],
  directives: [RatingComponent],
})
//@Injectable()
export class HeroDetailComponent implements OnInit {
    public hero: Hero;
    public isUnChanged: boolean = true;

    constructor(
        private _heroService: HeroService,
        private _routeParams: RouteParams) {
    }

    ngOnInit(){
        let id = +this._routeParams.get('id');

        this._heroService.getHeroes()
        .subscribe(
            heroes => 
            {
                this.hero = heroes.find(h => h.id == id);
                console.log(this.hero);
            },
            error => console.log(error)
        );
    }
    
    updateHero() {
        this._heroService.updateHero(this.hero)
        .subscribe(
            hero  => { this.isUnChanged = true; },
            error => console.log(error)
        );
    }
    
    goBack() {
        window.history.back();
    }
    
    onRatingChanged(rating: number){
        if (this.hero.rating != rating) {
            this.hero.rating = rating;
            this.isUnChanged = false;
        }
    }
    
    onNameChanged(){
        this.isUnChanged = false;
    }
}
