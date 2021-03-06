import { Component, OnInit } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AppComponent } from "../../app.component";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { PrintService } from "../print/print.service";

import { LoginDialogComponent } from "../login-dialog/login-dialog.component";
import { WaitDialogComponent } from "../wait-dialog/wait-dialog.component";

import * as FileSaver from "file-saver";

import { InputDataService } from "../../providers/input-data.service";
import { ResultDataService } from "../../providers/result-data.service";
import { ThreeService } from "../three/three.service";

import * as pako from "pako";

import { DataHelperModule } from "src/app/providers/data-helper.module";
import { SceneService } from "../three/scene.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { UserInfoService } from "src/app/providers/user-info.service";
import { environment } from "src/environments/environment";
import { PrintCustomFsecService } from "../print/custom/print-custom-fsec/print-custom-fsec.service";
import { LanguagesService } from "src/app/providers/languages.service";
import { ElectronService } from 'ngx-electron';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss", "../../app.component.scss"],
})
export class MenuComponent implements OnInit {
  loginUserName: string;
  public fileName: string;
  public version: string;

  constructor(
    private modalService: NgbModal,
    private app: AppComponent,
    private scene: SceneService,
    private helper: DataHelperModule,
    private InputData: InputDataService,
    public ResultData: ResultDataService,
    private PrintData: PrintService,
    private CustomFsecData: PrintCustomFsecService,
    private http: HttpClient,
    private three: ThreeService,
    public printService: PrintService,
    public auth: AngularFireAuth,
    public user: UserInfoService,
    public language: LanguagesService,
    public electronService: ElectronService,
    private translate: TranslateService
  ) {
    this.fileName = "";
    this.three.fileName = "";
    this.version = "";//process.env.npm_package_version;
  }

  ngOnInit() {
    this.fileName = "";
    this.three.fileName = "";
    this.helper.isContentsDailogShow = false;
    this.setDimension(3);
    this.http.get('assets/data/C1.json').subscribe(
      (response) => {
        this.readFile(response);
      },
      (error) => {
        console.log('?????????',error)
      }
    );
  }

  // ????????????
  renew(): void {
    this.app.dialogClose(); // ????????????????????????????????????
    this.InputData.clear();
    this.ResultData.clear();
    this.PrintData.clear();
    this.CustomFsecData.clear();
    this.three.ClearData();
    this.fileName = "";
    this.three.fileName = "";
    this.three.mode = "";
  }

  // ?????????????????????
  open(evt) {
    this.app.dialogClose(); // ????????????????????????????????????
    this.InputData.clear();
    this.ResultData.clear();
    this.PrintData.clear();
    this.CustomFsecData.clear();
    this.three.ClearData();
    // this.countArea.clear();
    const modalRef = this.modalService.open(WaitDialogComponent);

    const file = evt.target.files[0];
    this.fileName = file.name;
    this.three.fileName = file.name;
    evt.target.value = "";
    this.fileToText(file)
    .then((text) => {
      const jsonData: {} = JSON.parse(text);
      this.readFile(jsonData);
    })
    .catch((err) => {
      alert(err);
    });
    modalRef.close();
  }

  private readFile(jsonData){
    this.app.dialogClose(); // ????????????????????????????????????
    this.ResultData.clear(); // ?????????????????????
    const old = this.helper.dimension;
    let resultData: {} = null;
    if ("result" in jsonData) {
      resultData = jsonData["result"];
      delete jsonData["result"];
    }
    this.InputData.loadInputData(jsonData); // ????????????????????????
    if (resultData !== null) {
      this.ResultData.loadResultData(resultData); // ???????????????????????????
      this.ResultData.isCalculated = true;
    } else {
      this.ResultData.isCalculated = false;
    }
    if (old !== this.helper.dimension) {
      this.setDimension(this.helper.dimension);
    }
    this.three.fileload();
  }

  // ???????????????
  // ?????????????????????????????????????????????????????? electron ???????????????
  public overWrite(): void {
    if (this.fileName === ""){
      this.save();
      return;
    }
    const inputJson: string = JSON.stringify(this.InputData.getInputJson());
    this.fileName = this.electronService.ipcRenderer.sendSync('overWrite', this.fileName, inputJson);
  }

  private fileToText(file): any {
    const reader = new FileReader();
    reader.readAsText(file);
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
  }

  // ?????????????????????
  save(): void {
    const inputJson: string = JSON.stringify(this.InputData.getInputJson());
    if (this.fileName.length === 0) {
      this.fileName = "frameWebForJS.json";
      this.three.fileName = "frameWebForJS.json";
    }
    if (this.helper.getExt(this.fileName) !== "json") {
      this.fileName += ".json";
    }
    // ????????????
    if(this.electronService.isElectronApp) {
      this.fileName = this.electronService.ipcRenderer.sendSync('saveFile', this.fileName, inputJson);
    } else {
      const blob = new window.Blob([inputJson], { type: "text/plain" });
      FileSaver.saveAs(blob, this.fileName);
    }
  }

  // ??????
  public calcrate(): void {
    const modalRef = this.modalService.open(WaitDialogComponent);

    this.auth.currentUser.then((user) => {
      if (user === null) {
        modalRef.close();
        alert(this.translate.instant("menu.P_login"));
        return;
      }

      const jsonData: {} = this.InputData.getInputJson(0);

      if ("error" in jsonData) {
        alert(jsonData["error"]);
        modalRef.close(); // ????????????????????????????????????
        return;
      }

      jsonData["uid"] = user.uid;
      jsonData["production"] = environment.production;

      this.ResultData.clear(); // ??????????????????????????????

      this.post_compress(jsonData, modalRef);
    });
  }

  private post_compress(jsonData: {}, modalRef: NgbModalRef) {
    const url = environment.calcURL; // 'https://asia-northeast1-the-structural-engine.cloudfunctions.net/frameWeb-2';

    // json string ?????????
    const json = JSON.stringify(jsonData, null, 0);
    console.log(json);
    // pako ????????????gzip????????????
    const compressed = pako.gzip(json);
    //btoa() ????????????Base64?????????????????????
    const base64Encoded = btoa(compressed);

    this.http
      .post(url, base64Encoded, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          "Content-Encoding": "gzip,base64",
        }),
        responseType: "text",
      })
      .subscribe(
        (response) => {
          // ??????????????????????????????????????????????????????
          console.log(this.translate.instant("menu.success"));
          try {
            if (response.includes("error")) {
              throw response;
            }
            // Decode base64 (convert ascii to binary)
            const strData = atob(response);
            // Convert binary string to character-number array
            const charData = strData.split("").map(function (x) {
              return x.charCodeAt(0);
            });
            // Turn number array into byte-array
            const binData = new Uint8Array(charData);
            // Pako magic
            const json = pako.ungzip(binData, { to: "string" });

            const jsonData = JSON.parse(json);
            // ?????????????????????????????????????????????
            console.log(jsonData);
            if ("error" in jsonData) {
              throw jsonData.error;
            }

            // ?????????????????????
            const _jsonData = {};
            for (const key of Object.keys(jsonData)) {
              if ((typeof jsonData[key]).toLowerCase() === "number") {
                this.user[key] = jsonData[key];
              } else {
                _jsonData[key] = jsonData[key];
              }
            }

            this.InputData.getResult(jsonData);

            // ???????????????????????????
            this.ResultData.loadResultData(_jsonData);
            this.ResultData.isCalculated = true;
          } catch (e) {
            alert(e);
          } finally {
            modalRef.close(); // ????????????????????????????????????
            alert(
              this.user.deduct_points 
              + this.translate.instant("menu.deduct_points") 
              + this.user.new_points 
              + this.translate.instant("menu.new_points")
            );
          }
        },
        (error) => {
          let messege: string = "?????? " + error.statusText;
          if ("_body" in error) {
            messege += "\n" + error._body;
          }
          alert(messege);
          console.error(error);
          modalRef.close();
        }
      );
  }

  // ????????????????????????????????????
  public pickup(): void {
    let pickupJson: string;
    let ext: string;
    if (this.helper.dimension === 2) {
      pickupJson = this.ResultData.GetPicUpText2D();
      ext = ".pik";
    } else {
      pickupJson = this.ResultData.GetPicUpText();
      ext = ".csv";
    }
    const blob = new window.Blob([pickupJson], { type: "text/plain" });
    let filename: string = "frameWebForJS" + ext;
    if (this.fileName.length > 0) {
      filename = this.fileName.split(".").slice(0, -1).join(".");
      filename += ext;
    }
    // ????????????
    if(this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.sendSync('saveFile', filename, pickupJson);
    } else {
      FileSaver.saveAs(blob, filename);
    }
  }

  // ??????????????????
  logIn(): void {
    this.app.dialogClose(); // ????????????????????????????????????
    this.modalService.open(LoginDialogComponent).result.then((result) => {});
  }

  logOut(): void {
    this.auth.signOut();
  }

  //??????????????????????????????
  public dialogClose(): void {
    this.helper.isContentsDailogShow = false;
  }

  public contentsDailogShow(id): void {
    this.deactiveButtons();
    document.getElementById(id).classList.add("active");
    if (id === 13) {
      this.printService.clear();
      this.CustomFsecData.clear();
    }
    this.helper.isContentsDailogShow = true;
  }

  // ??????????????????????????????????????????????????????????????????????????????
  deactiveButtons() {
    for (let i = 0; i <= 13; i++) {
      const data = document.getElementById(i + "");
      if (data != null) {
        if (data.classList.contains("active")) {
          data.classList.remove("active");
        }
      }
    }
  }

  public setDimension(dim: number = null) {
    if (dim === null) {
      if (this.helper.dimension === 2) {
        this.helper.dimension = 3;
      } else {
        this.helper.dimension = 2;
      }
    } else {
      this.helper.dimension = dim;
      const g23D: any = document.getElementById("toggle--switch");
      g23D.checked = this.helper.dimension === 3;
    }
    this.app.dialogClose(); // ????????????????????????????????????
    this.scene.changeGui(this.helper.dimension);
  }

  // ????????? ---------------------------------------------
  private saveResult(text: string): void {
    const blob = new window.Blob([text], { type: "text/plain" });
    FileSaver.saveAs(blob, "frameWebResult.json");
  }

  //?????????????????????????????????
  resultopen(evt) {
    const modalRef = this.modalService.open(WaitDialogComponent);

    const file = evt.target.files[0];
    this.fileName = file.name;
    this.three.fileName = file.name;
    evt.target.value = "";

    this.fileToText(file)
      .then((text) => {
        this.app.dialogClose(); // ????????????????????????????????????
        this.ResultData.clear();
        const jsonData = JSON.parse(text);

        this.ResultData.loadResultData(jsonData);
        modalRef.close();
      })
      .catch((err) => {
        alert(err);
        modalRef.close();
      });
  }

  public goToLink() {
    window.open(
      "https://liberating-rodent-f3f.notion.site/4e2148bfe8704aa6b6dbc619d539c8c3?v=76a73b4693404e64a56ab8f8ff538e4d",
      "_blank"
    );
  }
}
