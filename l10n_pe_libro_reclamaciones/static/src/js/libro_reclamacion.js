/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.LibroReclamaciones = publicWidget.Widget.extend({
    selector: ".libro-reclamaciones",
    events:Object.assign({},{
        'change select[name="consumer_state_id"]':'change_consumer_state',
        'change select[name="consumer_province_id"]':'change_consumer_province',
        'change input[name="consumer_type"]':'change_consumer_type',
        'change input[name="consumer_younger"]':'change_consumer_younger',
        'input input':'toggle_print_button',
        'change select':'toggle_print_button',
        'click #imprimir_reclamo':'print_claim'
    }),
    start: function () {
        this.toggle_print_button();
        return this._super.apply(this, arguments);
    },
    change_consumer_state: function(ev){
        var self = this
        var consumer_state_id = $(ev.currentTarget).val()
        rpc('/get-provincia-libro-reclamaciones',
                        {'departamento': consumer_state_id}).then(async function (data) {
                await $(self.$el).find("select[name='consumer_province_id']").empty()
                await $(self.$el).find("select[name='consumer_district_id']").empty()
                $(self.$el).find("select[name='consumer_province_id']").append($('<option selected="" disabled="">Seleccionar</option>'))
                $(self.$el).find("select[name='consumer_district_id']").append($('<option selected="" disabled="">Seleccionar</option>'))
                for (let i = 0; i < data.length; i++) {
                    $(self.$el).find("select[name='consumer_province_id']").append($('<option /}>').val(data[i].id).text(data[i].name));
                }
        })
    },
    change_consumer_province:function(ev){
        var self = this
        var consumer_province_id = $(ev.currentTarget).val()
        rpc('/get-distrito-libro-reclamaciones',
                        {'provincia': consumer_province_id}).then(async function (data) {
                await $(self.$el).find("select[name='consumer_district_id']").empty()
                $(self.$el).find("select[name='consumer_district_id']").append($('<option selected="" disabled="">Seleccionar</option>'))
                for (let i = 0; i < data.length; i++) {
                    $(self.$el).find("select[name='consumer_district_id']").append($('<option /}>').val(data[i].id).text(data[i].name));
                }
        })
    },
    change_consumer_type:function(ev){
        var self = this;
        var company_type = $(ev.currentTarget).val()
        if(company_type === 'individual'){
            $(self.$el).find("#consumer_company_name").addClass("d-none")
            $(self.$el).find("#consumer_company_document").addClass("d-none")
        }else if(company_type === 'company'){
            $(self.$el).find("#consumer_company_name").removeClass("d-none")
            $(self.$el).find("#consumer_company_document").removeClass("d-none")
        }
        this.toggle_print_button();
    },
    change_consumer_younger:function(ev){
        var self = this;
        var consumer_younger = $(ev.currentTarget).is(':checked')
        if(consumer_younger){
            $(self.$el).find("#consumer_younger_title").removeClass("d-none")
            $(self.$el).find("#consumer_younger_content").removeClass("d-none")
        }else{
            $(self.$el).find("#consumer_younger_title").addClass("d-none")
            $(self.$el).find("#consumer_younger_content").addClass("d-none")
        }
    },
    toggle_print_button: function () {
        const requiredFields = [
            "consumer_name",
            "consumer_lastname",
            "consumer_email",
            "consumer_document",
            "consumer_phone",
            "consumer_address",
            "consumer_state_id",
            "consumer_province_id",
            "consumer_district_id",
        ];
        const isCompany = this.$el.find('input[name="consumer_type"]:checked').val() === "company";
        const companyFields = ["consumer_company_name", "consumer_company_document"];
        const fieldsToValidate = isCompany ? requiredFields.concat(companyFields) : requiredFields;

        const isComplete = fieldsToValidate.every((fieldName) => {
            const $field = this.$el.find(`[name="${fieldName}"]`);
            if (!$field.length) {
                return false;
            }
            return Boolean(String($field.val() || "").trim());
        });

        this.$el.find("#imprimir_reclamo")
            .prop("disabled", !isComplete)
            .toggleClass("btn-outline-secondary", !isComplete)
            .toggleClass("btn-success", isComplete);
    },
    print_claim: function () {
        window.print();
    }
});
