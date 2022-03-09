import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vector3 } from 'three';
import { ThreeDisplacementService } from './components/three/geometry/three-displacement.service';
// import * as sqlite3 from 'sqlite3';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  // private BL: number[][] = new Array(); // 縦桁
  // private BC: number[][] = new Array(); // 横桁
  // private SL: number[][] = new Array(); // 縦スラブ
  // private SC: number[][] = new Array(); // 横スラブ
  private nodeData = {};
  private mamberData = {};
  private disgData = [];

  private dz: number[][] = new Array(); // z方向の変位量
  private ry: number[][] = new Array(); // y軸周りの回転角
  private rx: number[][] = new Array(); // y軸周りの回転角

  constructor(
    private http: HttpClient,
    private disg: ThreeDisplacementService){
    this.initBeam();
    this.get_csv();
  }

  public onInit(){
    this.disg.onInit(this.nodeData, this.mamberData);
  }

  // 荷重の変更を反映する
  private no1 = 0;
  private no3 = 0;
  private no2 = 0;
  private no4 = 0;
  setLoad(p1: Vector3, p2: Vector3, p3: Vector3, p4: Vector3) {
    if(this.dz.length===0){
      return;
    }
    // 荷重が載荷された場所を特定する
    this.no1 = Math.round((10-p1.y) * 10 + p1.x * 1010); // 左上の節点番号
    this.no3 = Math.round((10-p3.y) * 10 + p3.x * 1010); // 左下の節点番号
    this.no2 = Math.round((10-p2.y) * 10 + p2.x * 1010); // 右上の節点番号
    this.no4 = Math.round((10-p4.y) * 10 + p4.x * 1010); // 右下の節点番号

    // 変位を集計し表示する
    for(const id of Object.keys(this.nodeData)){
      const d = this.get_dz(Number(id));
      this.disgData.push({
        id, 
        dx: 0, 
        dy: 0,
        dz: -d[0],
        rx: d[1],
        ry: d[2],
        rz: 0
      })
    }
    console.log(this.no1,
      this.no3,
      this.no2,
      this.no4,
      this.disgData[0])
      
    this.disg.changeData(1, this.disgData);
  }

  private get_dz(taiget: number){
    const colmns = this.no2 - this.no1;
    const height = this.no4 - this.no1;

    const title = this.dz[0];
    let col = 0;
    for(col=1; col<title.length; col++){
      if(title[col] === taiget){
        break
      }
    }

    let dz = 0;
    let ry = 0;
    let rx = 0;
    for(let i=this.no1; i<=this.no4;i++){
      for(let j=i; j<=i+colmns; j+=101){
        const a = Math.floor(j/101);
        const b = a*51+1;
        const c = a*101;
        const d = j-c;
        const index = Math.round(b+d);
        const col1 = this.dz[index];
        dz += col1[col];
        const col2 = this.rx[index];
        rx += col2[col];
        const col3 = this.ry[index];
        ry += col3[col];
      }
    }
    return [dz, rx, ry];
  }


  private get_csv(){
    this.http.get('assets/data/dz.csv',{
      responseType: 'text'}).subscribe(
      (response) => {
        const str: string = response.toString();

        // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
        for(let r of str.split("\n")){
          const d: number[] = new Array()
          for(let col of r.split(',')){
            d.push(Number(col));
          }
          this.dz.push(d);
        }

        this.http.get('assets/data/ry.csv',{
          responseType: 'text'}).subscribe(
          (response) => {
            const str: string = response.toString();

            // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
            for(let r of str.split("\n")){
              const d: number[] = new Array()
              for(let col of r.split(',')){
                d.push(Number(col));
              }
              this.ry.push(d);
            }

            this.http.get('assets/data/rx.csv',{
              responseType: 'text'}).subscribe(
              (response) => {
                const str: string = response.toString();
    
                // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
                for(let r of str.split("\n")){
                  const d: number[] = new Array()
                  for(let col of r.split(',')){
                    d.push(Number(col));
                  }
                  this.rx.push(d);
                }

                this.setLoad(
                  new Vector3(0,10,1),
                  new Vector3(5,10,1),
                  new Vector3(5,5,1),
                  new Vector3(0,5,1)
                )
              },
              (error) => {
                console.log('エラー',error)
              }
            );
          },
          (error) => {
            console.log('エラー',error)
          }
        );
      },
      (error) => {
        console.log('エラー',error)
      }
    );



  }

  private initBeam(){
    const c = 505*2;
    const r = 5*2;
    const cc= [0, 30, 70, 100];
    const rr= [0, 3030, 7070, 10100];

    // 縦桁
    const BL: number[][] = new Array();
    for(const j of cc){
      const L2: number[] = new Array();
      let ni: string = '';
      let nj: string = '';
      for(let i=0; i<=10100; i+=c){
        L2.push(i+j)

        if(ni===''){
          ni = (i+j).toString();
          continue;
        }
        nj = (i+j).toString();
        this.mamberData[ni+'-'+nj] = {
          ni, nj, 'cg': 0,
          'e': (j===0 || j=== 100) ? '1' : '2'
        }
        ni = nj;
      }
      BL.push(L2)
    }

    // 横桁
    const BC: number[][] = new Array();
    for(const j of rr){
      const C2: number[] = new Array();
      let ni: string = '';
      let nj: string = '';
      for(let i=0; i<=100; i+=r){
        C2.push(i+j)

        if(ni===''){
          ni = (i+j).toString();
          continue;
        }
        nj = (i+j).toString();
        this.mamberData[ni+'-'+nj] = {
          ni, nj, 'cg': 0,
          'e': (j===0 || j=== 100) ? '1' : '2'
        }
        ni = nj;
      }
      BC.push(C2)
    }

    // 節点データ
    for(const i of BC[0]){
      for(let j=0; j<=10100; j+=c){
        const no = (i+j).toString();
        this.nodeData[no] ={
          x: j / c,
          y: (100-i)/10,
          z: 0
        }
      }
    }

    // 縦スラブ
    for(const i of BC[0]){
      // 縦桁と同じ列はスキップ
      let a = false;
      for(const b of BL){
        if(i===b[0]){
          a=true;
          break
        }
      }
      if(a===true){
        continue
      }
      // スラブ部材
      const S2: number[] = new Array();
      let ni: string = '';
      let nj: string = '';
      for(let j=0; j<=10100; j+=c){
        S2.push(i+j)

        if(ni===''){
          ni = (i+j).toString();
          continue;
        }
        nj = (i+j).toString();
        this.mamberData[ni+'-'+nj] = {
          ni, nj, 'cg': 0,
          'e': '3'
        }
        ni = nj;
      }
      // this.SL.push(S2)
    }

    // 横スラブ
    for(const i of BL[0]){
      // 縦桁と同じ列はスキップ
      let a = false;
      for(const b of BL){
        if(i===b[0]){
          a=true;
          break
        }
      }
      if(a===true){
        continue
      }
      // スラブ部材
      const S2: number[] = new Array();
      let ni: string = '';
      let nj: string = '';

      for(let j=0; j<=100; j+=r){
        S2.push(i+j)

        if(ni===''){
          ni = (i+j).toString();
          continue;
        }
        nj = (i+j).toString();
        this.mamberData[ni+'-'+nj] = {
          ni, nj, 'cg': 0,
          'e': '3'
        }
        ni = nj;
      }
      // this.SC.push(S2)
    }

  }
}
