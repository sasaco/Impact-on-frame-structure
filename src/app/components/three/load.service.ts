import { Injectable } from '@angular/core';
import { SqliteService } from 'src/app/sqlite.service';
import * as THREE from 'three';
import { SceneService } from './scene.service';
import { TransformControls } from "./libs/TransformControls";
import { Vector3 } from 'three';

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
  private lines: THREE.Group;

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
    this.transformControl.translationSnap = 0.1; //
    this.createBox();

    // 初期化
    this.sq.onInit();
  }

  private createBox(){
    const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

    this.p1 = new THREE.Mesh( geometry, material );
    this.p1.position.set(3.1, 2.9, 1);
    this.p1.name="p1"
    this.scene.add( this.p1 );

    this.p2 = new THREE.Mesh( geometry, material );
    this.p2.position.set(4.9, this.p1.position.y, this.p1.position.z);
    this.p2.name="p2"
    this.scene.add( this.p2 );

    this.p3 = new THREE.Mesh( geometry, material );
    this.p3.position.set(this.p2.position.x, 0, this.p1.position.z);
    this.p3.name="p3"
    this.scene.add( this.p3 );

    this.p4 = new THREE.Mesh( geometry, material );
    this.p4.position.set(this.p1.position.x, this.p3.position.y, this.p1.position.z);
    this.p4.name="p4"
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
    this.cube = new THREE.Mesh( geometry2, material2 );
    this.cube.position.set(
      (this.p1.position.x + this.p2.position.x)/2,
      (this.p2.position.y + this.p3.position.y)/2,
      depth/2);
    this.scene.add( this.cube );

    // ライン
    this.lines = new THREE.Group();
    // 横線
    const material3 = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    let points:Vector3[] = new Array();
    points.push( new Vector3(-width/2, height/2, depth) );
    points.push( new Vector3(width/2, height/2, depth) );
    points.push( new Vector3(width/2, -height/2, depth) );
    points.push( new Vector3(-width/2, -height/2, depth) );
    points.push( points[0] );
    const geometry3 = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry3, material3 );
    this.lines.add(line);
    // 縦線
    for(let i=0; i< points.length-1;i++){
      const p: Vector3 = points[i];
      const geometry4 = new THREE.BufferGeometry().setFromPoints(
        [p, new Vector3(p.x, p.y, 0)]
      );
      this.lines.add(new THREE.Line( geometry4, material3 ));
    }
    this.lines.position.set(
      this.cube.position.x,
      this.cube.position.y,
      0
      );//.set(width/2,this.p3.position.y + height/2, 0);
    this.scene.add( this.lines );

    // 計算サービスに通知
    // csv の読み込み遅延のため
    // this.sq.setLoad(this.p1.position, this.p2.position, this.p3.position, this.p4.position);
  }

  private dragging_hanged( event ){
    this.scene.controls.enabled = ! event.value;
  }

  private updateSplineOutline() {
    const obj = this.transformControl.object;
    // 大小関係
    if(this.p1.position.x + 0.1 > this.p2.position.x){
      this.p2.position.x = this.p1.position.x + 0.1
    }
    if(this.p4.position.x + 0.1 > this.p3.position.x){
      this.p3.position.x = this.p4.position.x + 0.1
    }
    if(this.p4.position.y + 0.1 > this.p1.position.y){
      this.p1.position.y = this.p4.position.y + 0.1
    }
    if(this.p3.position.y + 0.1 > this.p2.position.y){
      this.p2.position.y = this.p3.position.y + 0.1
    }

    //最大値・最小値
    for(const p of [this.p1,this.p2,this.p3,this.p4]){
      if(p.position.x > 10){
        p.position.x = 10;
      }
      if(p.position.x < 0){
        p.position.x = 0;
      }
      if(p.position.y > 10){
        p.position.y = 10;
      }
      if(p.position.y < 0){
        p.position.y = 0;
      }
    }
    // 4隅の点の位置を更新
    if(obj.name==='p4'){
      this.p1.position.x = obj.position.x;
      this.p3.position.y = obj.position.y;
    } else if(obj.name==='p3'){
      this.p2.position.x = obj.position.x;
      this.p4.position.y = obj.position.y;
    } else if(obj.name==='p2'){
      this.p3.position.x = obj.position.x;
      this.p1.position.y = obj.position.y;
    } else if(obj.name==='p1'){
      this.p4.position.x = obj.position.x;
      this.p2.position.y = obj.position.y;
    }
    for(const p of [this.p1,this.p2,this.p3,this.p4]){
      if(p.name === obj.name){
        continue;
      }
      p.position.z = obj.position.z;
    }
    // ボックスの形状を更新
    const depth = obj.position.z;
    const width = this.p2.position.x - this.p1.position.x;
    const height = this.p1.position.y - this.p3.position.y;

    this.cube.scale.x = width / 5;
    this.cube.scale.y = height / 5;
    this.cube.scale.z = depth;
    this.cube.position.x = width/2 + this.p1.position.x;
    this.cube.position.y = height/2 + this.p3.position.y;
    this.cube.position.z = obj.position.z/2;

    // ラインの形状を更新
    this.lines.scale.x = width / 5;
    this.lines.scale.y = height / 5;
    this.lines.scale.z = depth;
    this.lines.position.x = width/2 + this.p1.position.x;
    this.lines.position.y = height/2 + this.p3.position.y;
    this.lines.position.z = 0;

    // 計算サービスに通知
    this.sq.setLoad(this.p1.position, this.p2.position, this.p3.position, this.p4.position);
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
