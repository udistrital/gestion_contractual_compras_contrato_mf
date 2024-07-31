import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ParametrosService } from 'src/app/services/parametros.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-paso-info-general',
  templateUrl: './paso-info-general.component.html',
  styleUrls: ['./paso-info-general.component.css'],
})

export class PasoInfoGeneralComponent implements OnInit {
  showContratoFields = false;
  showConvenioFields = false;
  maxDate!: Date;

  constructor(private _formBuilder: FormBuilder, private parametrosService: ParametrosService, private cdRef: ChangeDetectorRef) { }

  form = this._formBuilder.group({
    tipoCompromiso: ['', Validators.required],
    tipoContrato: ['', Validators.required],
    perfilContratista: [''],
    fechaSuscripcion: [''],
    aplicaPoliza: [''],
    vigenciaConvenio: [''],
    convenio: [''],
    nombreConvenio: [''],
    modalidadSeleccion: ['', Validators.required],
    tipologiaEspecifica: ['', Validators.required],
    regimenContratacion: ['', Validators.required],
    procedimiento: ['', Validators.required],
    plazoEjecucion: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    unidadEjecucion: ['', Validators.required],
  });

  compromisos: any[] = [];
  contratos: any[] = [];
  modalidad_seleccion: any[] = [];
  tipologia_especifica: any[] = [];
  regimen_contratacion: any[] = [];
  procedimiento: any[] = [];
  plazo_ejecucion: any[] = [];
  unidad_ejecucion: any[] = [];

  // orden-contrato
  perfil_contratista: any[] = [];
  aplica_poliza: { value: string; viewValue: string }[] = [
    { value: '0', viewValue: 'No' },
    { value: '1', viewValue: 'Si' },
  ];
  // convenio
  vigencia_convenio: any[] = [];
  convenio: any[] = [];
  nombre_convenio: any[] = [];

  ngOnInit(): void {
    this.maxDate = new Date();
    this.CargarCompromisos();
    this.CargarModalidadSeleccion();
    this.CargarRegimenContratacion();
    this.CargarProcedimiento();
    this.CargarUnidadEjecucion();

    this.form.get('tipoCompromiso')?.valueChanges.subscribe((id_compromiso) => {
      if (id_compromiso) {
        this.CargarContratos(id_compromiso);
        this.showFieldsBasedOnCompromiso(id_compromiso);
        if (id_compromiso) {
          this.CargarTipologiaEspecifica(id_compromiso);

          const idCompromisoStr = id_compromiso.toString();
          const perfilCompromisoIdStr = environment.ORDEN_ID.toString();

          const perfilCompromisoControl = this.form.get('aplicaPoliza');
          if (idCompromisoStr === perfilCompromisoIdStr) {
            perfilCompromisoControl?.setValidators(Validators.required);
            perfilCompromisoControl?.enable();
          } else {
            perfilCompromisoControl?.clearValidators();
            perfilCompromisoControl?.disable();
          }
          perfilCompromisoControl?.updateValueAndValidity();

          this.cdRef.detectChanges();
        }
      }
    });

    this.form.get('tipoContrato')?.valueChanges.subscribe((id_contrato) => {
      if (id_contrato) {
        this.CargarTipologiaEspecifica(id_contrato);

        const idContratoStr = id_contrato.toString();
        const tipoContratoIdStr = environment.CONTRATO_PSPAG_ID.toString();

        const perfilContratistaControl = this.form.get('perfilContratista');
        const fechaSuscripcionControl = this.form.get('fechaSuscripcion');

        if (idContratoStr === tipoContratoIdStr) {
          this.CargarPerfilContratista(id_contrato);
          perfilContratistaControl?.setValidators(Validators.required);
          perfilContratistaControl?.enable();

          fechaSuscripcionControl?.setValidators(Validators.required);
          fechaSuscripcionControl?.enable();
        } else {
          perfilContratistaControl?.clearValidators();
          perfilContratistaControl?.disable();

          fechaSuscripcionControl?.clearValidators();
          fechaSuscripcionControl?.disable();
        }
        perfilContratistaControl?.updateValueAndValidity();

        this.cdRef.detectChanges();
      }
    });

  }

  //Generales

  CargarCompromisos() {
    this.parametrosService.get('parametro?query=TipoParametroId:' + environment.TIPO_COMPROMISO_ID + '&limit=0').subscribe((Response: any) => {
      if (Response.Status == "200") {
        this.compromisos = Response.Data;
      }
    })
  }

  CargarModalidadSeleccion() {
    this.parametrosService.get('parametro?query=TipoParametroId:' + environment.MODALIDAD_SELECCION_ID + '&limit=0').subscribe((Response: any) => {
      if (Response.Status == "200") {
        this.modalidad_seleccion = Response.Data;
      }
    })
  }

  CargarRegimenContratacion() {
    this.parametrosService.get('parametro?query=TipoParametroId:' + environment.REGIMEN_CONTRATACION_ID + '&limit=0').subscribe((Response: any) => {
      if (Response.Status == "200") {
        this.regimen_contratacion = Response.Data;
      }
    })
  }

  CargarProcedimiento() {
    this.parametrosService.get('parametro?query=TipoParametroId:' + environment.PROCEDIMIENTO_ID + '&limit=0').subscribe((Response: any) => {
      if (Response.Status == "200") {
        this.procedimiento = Response.Data;
      }
    })
  }

  CargarUnidadEjecucion() {
    this.parametrosService.get('parametro?query=TipoParametroId:' + environment.UNIDAD_EJECUCION_ID + ',Id__in:166|180|181&limit=0').subscribe((Response: any) => {
      if (Response.Status == "200") {
        this.unidad_ejecucion = Response.Data;
      }
    })
  }

  //Especificos

  showFieldsBasedOnCompromiso(id_compromiso: string) {
    const idCompromisoStr = id_compromiso.toString();

    this.showContratoFields = idCompromisoStr === environment.CONTRATO_ID || idCompromisoStr === environment.ORDEN_ID;
    this.showConvenioFields = idCompromisoStr === environment.CONVENIO_ID;

    const convenioFields = ['vigenciaConvenio', 'convenio', 'nombreConvenio'];

    [...convenioFields, 'perfilContratista', 'aplicaPoliza', 'fechaSuscripcion'].forEach(field => {
      const control = this.form.get(field);
      if (control) {
        control.reset();
        if ((this.showConvenioFields && convenioFields.includes(field))) {
          control.setValidators(Validators.required);
          control.enable();
        } else {
          control.clearValidators();
          control.disable();
        }
        control.updateValueAndValidity();
      }
    });

    this.cdRef.detectChanges();
  }

  CargarContratos(id_compromiso: string) {
    this.parametrosService.get('parametro?query=ParametroPadreId:' + id_compromiso + '&TipoParametroId:' + environment.TIPO_CONTRATO_ID + '&limit=0').subscribe((Response: any) => {
      if (Response.Status == "200") {
        this.contratos = Response.Data;
      }
    })
  }

  CargarTipologiaEspecifica(id_contrato: string) {
    this.parametrosService.get('parametro?query=ParametroPadreId:' + id_contrato + '&TipoParametroId:' + environment.TIPOLOGIA_ESPECIFICA_ID + '&limit=0').subscribe((Response: any) => {
      if (Response.Status == "200") {
        this.tipologia_especifica = Response.Data;
      }
    })
  }

  CargarPerfilContratista(id_contrato: string) {
    if (id_contrato == environment.CONTRATO_PSPAG_ID) {
      this.parametrosService.get('parametro?query=TipoParametroId:' + environment.PERFIL_CONTRATISTA_ID + '&ParametroPadreId:' + id_contrato + '&limit=0').subscribe((Response: any) => {
        if (Response.Status == "200") {
          this.perfil_contratista = Response.Data;
        }
      });
    }
  }

  // Método para manejar la entrada de solo números
  
  onlyNumbers(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
    ];
    const pattern = /^[0-9]$/;

    if (!allowedKeys.includes(event.key) && !pattern.test(event.key)) {
      event.preventDefault();
    }
  }
}