<template>
    <div v-if="Object.keys(roles).length > 0" class="project-roles">
        <div v-for="role in getUsefulRoles" :key="role.id" class="project-roles__role">
            <div class="row">
                <div class="col-7">
                    <at-tooltip
                        :content="$t('users.project-roles-description.' + role.name)"
                        placement="left-top"
                        class="custom-tooltip-roles"
                    >
                        <at-input readonly :value="$t('users.role.' + role.name)" class="read-input-role">
                            <template slot="prepend"> {{ $t('users.role.name') }} </template>
                        </at-input>
                    </at-tooltip>
                </div>

                <div class="col-17">
                    <validation-provider :ref="'provider' + '_' + role.id" v-slot="{ errors }" vid="relation_provider">
                        <multi-select
                            :key="role.id"
                            placeholder="control.project_selected"
                            :service="service"
                            :selected="getProjectsForRole(role.id)"
                            :inputHandler="projectIds => updateRelation(role.id, projectIds)"
                            :class="{
                                'at-select--error': errors.length > 0,
                            }"
                        >
                        </multi-select>
                        <small v-if="errors.length" class="error">{{ errors[0] }}</small>
                    </validation-provider>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex';
    import MultiSelect from '@/components/MultiSelect';
    import { ValidationProvider } from 'vee-validate';

    export default {
        name: 'ProjectRoles',
        props: {
            relations: {
                type: Object,
                required: true,
            },
            service: {
                type: Object,
                required: true,
            },
        },
        components: {
            MultiSelect,
            ValidationProvider,
        },
        data() {
            return {
                projects: [],
                selectedProjects: [],
            };
        },
        computed: {
            ...mapGetters('roles', ['roles']),
            getUsefulRoles() {
                // Remove an unused user role
                return this.roles.filter(({ name }) => name !== 'user');
            },
        },
        methods: {
            ...mapActions({
                getRoles: 'roles/loadRoles',
            }),
            async load() {
                await this.getRoles();
            },
            getProjectsForRole(roleId) {
                return roleId in this.relations ? this.relations[roleId].project_ids : [];
            },
            updateRelation(roleId, projectIds) {
                let selectedProjects = [];

                Object.keys(this.relations)
                    .filter(roleID => this.getUsefulRoles.map(role => Number(role.id)).includes(Number(roleID)))
                    .forEach(roleID => {
                        selectedProjects = selectedProjects.concat(this.relations[roleID].project_ids);
                    });

                let result = {};
                let duplicatesCheck = new Set(selectedProjects).size !== selectedProjects.length;

                if (duplicatesCheck) {
                    result = {
                        errors: ['This project(-s) were already used for another role!'],
                        valid: false,
                        failedRules: {},
                    };
                } else {
                    result = {
                        errors: [],
                        valid: true,
                        failedRules: {},
                    };
                }

                this.$refs['provider' + '_' + roleId][0].applyResult(result);

                if (roleId in this.relations) {
                    this.relations[roleId].project_ids = projectIds;
                } else {
                    this.relations[roleId] = {
                        project_ids: projectIds,
                        role_id: roleId,
                    };
                }

                this.$emit('updateRelation', this.relations);
                return this.relations;
            },
        },
        async created() {
            await this.load();
        },
    };
</script>

<style lang="scss" scoped>
    .project-roles {
        &__role {
            margin-bottom: $layout-01;

            &:last-child {
                margin-bottom: 0;
            }
        }
        ::v-deep {
            .read-input-role {
                cursor: pointer;

                .at-input__original:hover,
                .at-input__original:focus {
                    border-color: #c5d9e8 !important;
                    cursor: pointer;
                }
            }
        }
    }
</style>
