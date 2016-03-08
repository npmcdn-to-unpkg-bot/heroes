import { Component, OnInit, provide } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import { HTTP_PROVIDERS, XHRBackend } from 'angular2/http';

import { HeroService }              from './hero.service';
import { HeroesComponent }          from './heroes.component';
import { DashboardComponent }       from './dashboard.component';
import { HeroDetailComponent }      from './hero-detail.component';
import { AboutComponent }           from './about.component';
import {Settings }                  from './settings'

// in-memory web api imports
import {InMemoryBackendService,
        SEED_DATA}         from 'a2-in-memory-web-api/core';
import {HeroData}          from './hero-data';

@Component({
  selector: 'my-app',
  styleUrls: ['app/app.component.css'],
  template: `
    <h1>{{title}}</h1>
    <nav>
    <a [routerLink]="['Dashboard']">Dashboard</a>
    <a [routerLink]="['Heroes']">Heroes</a>
    <a [routerLink]="['About']">About</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES],
  providers: [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    HeroService,
    Settings,
     // in-memory web api providers
    provide(XHRBackend, { useClass: InMemoryBackendService }), // in-mem server
    provide(SEED_DATA,  { useClass: HeroData }) // in-mem server data
  ]
})
@RouteConfig([
  {
    path: '/heroes',
    name: 'Heroes',
    component: HeroesComponent
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardComponent,
    useAsDefault: true
  },
  {
    path: '/detail/:id',
    name: 'HeroDetail',
    component: HeroDetailComponent
   },
  {
    path: '/about',
    name: 'About',
    component: AboutComponent
   },
])
export class AppComponent implements OnInit {
  public title: string = 'Still loading ...';
    
    constructor() {
    }
    
    ngOnInit() {
        this.title = 'Tour of Heroes';
    }
}

