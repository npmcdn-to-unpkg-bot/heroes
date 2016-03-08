import {Component,OnInit,AfterViewInit,EventEmitter,Output,ChangeDetectionStrategy} from 'angular2/core';
//import {logClass, logClassWithArgs, logProperty, logMethod} from './log-decorator';

import { Star } from './star';

@Component({
    selector: 'my-rating',
    templateUrl: 'app/rating.component.html',
    styleUrls:[],
    changeDetection: ChangeDetectionStrategy.CheckAlways,
    inputs: ['rating']
})
export class RatingComponent implements OnInit {
    public stars: Star[]; 
    public rating: number;
    @Output() onChanged = new EventEmitter<number>();
    public starImageSrc: string = 'app/star_silver.JPG';
    
    ngOnInit() {
        this.stars = 
        [ 
            {"id":1, "selected": false, "src": 'app/star_silver.JPG'}, 
            {"id":2, "selected": false, "src": 'app/star_silver.JPG'}, 
            {"id":3, "selected": false, "src": 'app/star_silver.JPG'}, 
            {"id":4, "selected": false, "src": 'app/star_silver.JPG'}, 
            {"id":5, "selected": false, "src": 'app/star_silver.JPG'} 
        ];
        this.initialize();
    }
    
    initialize() {
        this.set(this.rating);        
    }
    
    toggleSelect(idx) {
        this.stars.forEach((s,i) => {
            if (i <= idx) 
            { 
                s.selected = true;
                s.src = 'app/star_gold.JPG';
            } else {
                s.selected = false;
                s.src = 'app/star_silver.JPG';
            }
        });
        this.rating =  idx+1;
        
        //console.log('RatingComponent - SET rating to ' + this.rating);
        
        this.onChanged.emit(this.rating);
    }
    
    set(rating){
        this.toggleSelect(rating - 1);
    }
    
}