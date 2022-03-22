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

  private load: {
    p1: THREE.Mesh,
    p2: THREE.Mesh,
    p3: THREE.Mesh,
    p4: THREE.Mesh,
    cube: THREE.Mesh,
    lines: THREE.Group,
  }[];

  constructor(
    private scene: SceneService,
    private sq: SqliteService) {
      this.load = new Array();
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
    const pos = [{
        p1: new Vector3(0,10,1),
        p2: new Vector3(5,10,1),
        p3: new Vector3(5,5,1),
        p4: new Vector3(0,5,1)
      },{
        p1: new Vector3(0,5,1),
        p2: new Vector3(5,5,1),
        p3: new Vector3(5,0,1),
        p4: new Vector3(0,0,1)
      }
    ];
    for(let i=0; i<2;i++){
      const p1 = new THREE.Mesh( geometry, material );
      p1.position.set(pos[i].p1.x, pos[i].p1.y, pos[i].p1.z);
      p1.name="p1" + i;
      this.scene.add( p1 );

      const p2 = new THREE.Mesh( geometry, material );
      p2.position.set(pos[i].p2.x, pos[i].p2.y, pos[i].p2.z);
      p2.name="p2" + i;
      this.scene.add( p2 );

      const p3 = new THREE.Mesh( geometry, material );
      p3.position.set(pos[i].p3.x, pos[i].p3.y, pos[i].p3.z);
      p3.name="p3" + i;
      this.scene.add( p3 );

      const p4 = new THREE.Mesh( geometry, material );
      p4.position.set(pos[i].p4.x, pos[i].p4.y, pos[i].p4.z);
      p4.name="p4" + i;
      this.scene.add( p4 );

      const width = p2.position.x - p1.position.x;
      const height = p1.position.y - p3.position.y;
      const depth = p1.position.z;

      const geometry2 = new THREE.BoxGeometry( width, height, depth );
      const material2 = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        opacity: 0.2,
        transparent: true
      });
      const cube = new THREE.Mesh( geometry2, material2 );
      cube.position.set(width/2,p3.position.y + height/2,depth/2);
      this.scene.add( cube );

      // ライン
      const lines = new THREE.Group();
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
      lines.add(line);
      // 縦線
      for(let i=0; i< points.length-1;i++){
        const p: Vector3 = points[i];
        const geometry4 = new THREE.BufferGeometry().setFromPoints(
          [p, new Vector3(p.x, p.y, 0)]
        );
        lines.add(new THREE.Line( geometry4, material3 ));
      }
      lines.position.set(width/2,p3.position.y + height/2, 0);
      this.scene.add( lines );

      // 登録
      this.load.push({
        p1,p2,p3,p4,cube,lines
      });
      
    }

    // 計算サービスに通知
    // csv の読み込み遅延のため
    // this.sq.setLoad(this.p1.position, this.p2.position, this.p3.position, this.p4.position);
  }

  private dragging_hanged( event ){
    this.scene.controls.enabled = ! event.value;
  }

  private updateSplineOutline() {
    const obj = this.transformControl.object;
    // 末尾を取得
    let pp = this.load[0];
    let pp2 = this.load[1];
    if(obj.name.slice(-1) ==='1'){
      pp = this.load[1];
      pp2 = this.load[0];
    }

    //最大値・最小値
    for(const p of [pp.p1,pp.p2,pp.p3,pp.p4]){
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
    if(obj.name.includes('p4')){
      pp.p1.position.x = obj.position.x;
      pp.p3.position.y = obj.position.y;
    } else if(obj.name.includes('p3')){
      pp.p2.position.x = obj.position.x;
      pp.p4.position.y = obj.position.y;
    } else if(obj.name.includes('p2')){
      pp.p3.position.x = obj.position.x;
      pp.p1.position.y = obj.position.y;
    } else if(obj.name.includes('p1')){
      pp.p4.position.x = obj.position.x;
      pp.p2.position.y = obj.position.y;
    }
    for(const p of [pp.p1,pp.p2,pp.p3,pp.p4]){
      if(p.name === obj.name){
        continue;
      }
      p.position.z = obj.position.z;
    }
    // ボックスの形状を更新
    const depth = obj.position.z;
    const width = pp.p2.position.x - pp.p1.position.x;
    const height = pp.p1.position.y - pp.p3.position.y;

    pp.cube.scale.x = width / 5;
    pp.cube.scale.y = height / 5;
    pp.cube.scale.z = depth;
    pp.cube.position.x = width/2 + pp.p1.position.x;
    pp.cube.position.y = height/2 + pp.p3.position.y;
    pp.cube.position.z = obj.position.z/2;

    // ラインの形状を更新
    pp.lines.scale.x = width / 5;
    pp.lines.scale.y = height / 5;
    pp.lines.scale.z = depth;
    pp.lines.position.x = width/2 + pp.p1.position.x;
    pp.lines.position.y = height/2 + pp.p3.position.y;
    pp.lines.position.z = 0;

    // 計算サービスに通知
    this.sq.setLoad([{
      p1: pp.p1.position, 
      p2: pp.p2.position, 
      p3: pp.p3.position, 
      p4: pp.p4.position
    },{
      p1: pp2.p1.position, 
      p2: pp2.p2.position, 
      p3: pp2.p3.position, 
      p4: pp2.p4.position
    }]);
  }

  public detectObject( raycaster: THREE.Raycaster, action: string ) {

    const intersects = raycaster.intersectObjects( [
      this.load[0].p1,this.load[0].p2,this.load[0].p3,this.load[0].p4,
      this.load[1].p1,this.load[1].p2,this.load[1].p3,this.load[1].p4
    ], 
    false );

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
