import { Component, OnInit, ContentChild, AfterContentInit} from 'angular2/core';
import { RatingComponent } from './rating.component'

@Component({
  template: `
    <h2>{{title}}</h2>
    <p>It's all entertainment.</p>
    <my-rating rating="{{whatsmyrating}}" #theRater (onChanged)="onRated($event)"></my-rating>
    
    <p><span (click)="check(theRater.rating)">My rating is:</span> {{theRater.rating}}.
  `,
  directives: [RatingComponent],
  //inputs: ['rating']
})
export class AboutComponent implements OnInit {
    public title = 'About this app';
    public whatsmyrating: number = 2;
    //@ContentChild(RatingComponent) rater;
    
    constructor(){
        this.whatsmyrating = 2;
    }
    
    ngOnInit(){
        this.showProviderData();
    }
    
    check(r) {
        console.log('Rating:' + r);
        this.showProviderData();
    }
    
    showProviderData(){
        //console.log('R:' + this.whatsmyrating);
    }
    
    onRated(){
        this.showProviderData();
    }
}