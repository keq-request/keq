

import Handlebars from 'handlebars'
// import { readTemplate } from '../utils/read-template.js'
import commentTemplateStr from '../templates/snippet/comment.hbs'
import shapeTemplateStr from '../templates/json-schema/shape.hbs'
import shapeEnumTemplateStr from '../templates/json-schema/shape/enum.hbs'
import shapeObjectTemplateStr from '../templates/json-schema/shape/object.hbs'
import shapeArrayTemplateStr from '../templates/json-schema/shape/array.hbs'
import shapeOneOfTemplateStr from '../templates/json-schema/shape/one-of.hbs'
import shapeAnyOfTemplateStr from '../templates/json-schema/shape/any-of.hbs'
import shapeAllOfTemplateStr from '../templates/json-schema/shape/all-of.hbs'
import interfaceTemplateStr from '../templates/json-schema/interface.hbs'


// Handlebars.registerPartial('snippet/comment', readTemplate('snippet/comment'))

Handlebars.registerPartial('snippet/comment', commentTemplateStr)

Handlebars.registerPartial('t_json_schema_shape', shapeTemplateStr)
Handlebars.registerPartial('t_json_schema_shape__enum', shapeEnumTemplateStr)
Handlebars.registerPartial('t_json_schema_shape__object', shapeObjectTemplateStr)
Handlebars.registerPartial('t_json_schema_shape__array', shapeArrayTemplateStr)
Handlebars.registerPartial('t_json_schema_shape__one_of', shapeOneOfTemplateStr)
Handlebars.registerPartial('t_json_schema_shape__any_of', shapeAnyOfTemplateStr)
Handlebars.registerPartial('t_json_schema_shape__all_of', shapeAllOfTemplateStr)
Handlebars.registerPartial('t_json_schema_interface', interfaceTemplateStr)

// Handlebars.registerPartial('t_json_schema_shape__enum', readTemplate('json-schema/shape/enum'))
// Handlebars.registerPartial('t_json_schema_shape__object', readTemplate('json-schema/shape/object'))
// Handlebars.registerPartial('t_json_schema_shape__array', readTemplate('json-schema/shape/array'))
// Handlebars.registerPartial('t_json_schema_shape__one_of', readTemplate('json-schema/shape/one-of'))
// Handlebars.registerPartial('t_json_schema_shape__any_of', readTemplate('json-schema/shape/any-of'))
// Handlebars.registerPartial('t_json_schema_shape__all_of', readTemplate('json-schema/shape/all-of'))
// Handlebars.registerPartial('t_json_schema_interface', readTemplate('json-schema/interface'))
