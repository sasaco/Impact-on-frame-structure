import { Injectable } from '@angular/core';
import { ThreeSectionForceService } from './components/three/geometry/three-section-force/three-section-force.service';

@Injectable({
  providedIn: 'root'
})
export class SqfoceService {
  constructor(
    private force: ThreeSectionForceService) { }

  // nodeData: 節点データ
  // mamberData: 部材データ
  // BL: 縦桁の部材番号
  // BC: 横桁の部材番号
  // disgData: 変位の情報
  setForce(nodeData: {}, mamberData: {}, BL: number[][], BC: number[][], disgData: any[]) {

    // 縦桁と横桁の部材だけ
    const mamber = {};
    for(const key of Object.keys(mamberData)){
      const m = mamberData[key];
      if(m.e==='3'){
        continue
      }
      m['m'] = key;
      mamber[key] = m;
    }
    this.force.OnInit(nodeData, mamber);

    // 断面力を集計する
    const fsecJson = [];
    for(const key of Object.keys(mamber)){
      const mm = mamber[key];
      let m: string = mm.m;
      for(const n of [mm.ni, mm.nj]){
        
        fsecJson.push({
          m,
          fx: 0,
          fy: 0,
          fz: 0,
          mx: 0,
          my: 0,
          mz: 0,
          l: 0,
          n: '',
          row: 0
        });
        m = '';
      }


    }



    console.log(disgData)
    this.force.setResultData({'1': fsecJson}, 1, 1)

  }

}
