import { Injectable } from '@angular/core';
import { SqliteService } from 'src/app/sqlite.service';
import * as THREE from 'three';
import { SceneService } from './scene.service';
import { TransformControls } from "./libs/TransformControls";

@Injectable({
  providedIn: 'root'
})
export class LoadService {

  public transformControl : TransformControls = null;
  private p1: THREE.Mesh;
  private p2: THREE.Mesh;
  private p3: THREE.Mesh;
  private p4: THREE.Mesh;
  private cube: THREE.Mesh;

  constructor(
    private scene: SceneService,
    private sq: SqliteService) {
    }

  public onInit() {
    // 最初の荷重を追加

    // マウスで移動できるコントロール
    this.transformControl = new TransformControls(
      this.scene.camera,
      this.scene.labelRenderer.domElement
    );
    this.transformControl.addEventListener( 'change', this.scene.render );
    this.transformControl.addEventListener( 'dragging-changed', ( event )=> {
      this.dragging_hanged(event);
    });
    this.scene.add( this.transformControl );
    this.transformControl.addEventListener( 'objectChange', () => {
      this.updateSplineOutline();
    });
    this.transformControl.showZ = false; // 当面の間

    this.createBox();
  }

  private createBox(){
    const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

    this.p1 = new THREE.Mesh( geometry, material );
    this.p1.position.set(0, 10, 1);
    this.scene.add( this.p1 );

    this.p2 = new THREE.Mesh( geometry, material );
    this.p2.position.set(5, this.p1.position.y, this.p1.position.z);
    this.scene.add( this.p2 );

    this.p3 = new THREE.Mesh( geometry, material );
    this.p3.position.set(this.p2.position.x, 5, this.p1.position.z);
    this.scene.add( this.p3 );

    this.p4 = new THREE.Mesh( geometry, material );
    this.p4.position.set(this.p1.position.x, this.p3.position.y, this.p1.position.z);
    this.scene.add( this.p4 );

    const width = this.p2.position.x - this.p1.position.x;
    const height = this.p1.position.y - this.p3.position.y;
    const depth = this.p1.position.z;

    const geometry2 = new THREE.BoxGeometry( width, height, depth );
    const material2 = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      opacity: 0.2,
      transparent: true
    });
    const material3 = new THREE.MeshBasicMaterial({
      color: 0x990000, //球の色
      wireframe: true //ワイヤーフレーム有効

    });
    this.cube = new THREE.Mesh( geometry2, material2 );
    this.cube.position.set(width/2,this.p3.position.y + height/2,depth/2);
    this.scene.add( this.cube );

    const a = this.cube.clone();
    a.material = material3
    this.scene.add( a );

  }

  private dragging_hanged( event ){
    this.scene.controls.enabled = ! event.value;
  }

  private updateSplineOutline() {
    console.log(this.p1.position)
  }

  public detectObject( raycaster: THREE.Raycaster, action: string ) {

    const intersects = raycaster.intersectObjects( [this.p1,this.p2,this.p3,this.p4], false );

    if ( intersects.length > 0 ) {

      const object = intersects[ 0 ].object;

      if ( object !== this.transformControl.object ) {

        this.transformControl.attach( object );

      }

    } else if(action !== 'hover'){
      this.transformControl.detach();
    }

  }

}
