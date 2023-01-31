Hooks.on('renderDrawingConfig', (app, html)=>{
  console.log(game.user.getFlag('drawing-presets', 'presets'))
  let $presets = $(`<section class="presets" style="margin-top:.5em;"><style>#${app.id}{height:auto !important;}</style><input type="text" placeholder="Preset Name" style="display:inline; width: 92%;"></input></section>`);
  $presets.append($('<a class="save-preset" style="width: 8%; display: inline-block; text-align: center;" data-tooltip="Save Preset"><i class="fa-solid fa-floppy-disk"></i></a>').click(async function(){
    let name = $(this).prev().val();
    if (!name) return ui.notifications.warn("Enter a Preset Name");
    let formArray = html.find('form').serializeArray();
    let config = formArray.reduce((config, field)=>{config[field.name]=field.value; return config;},{});
    config = foundry.utils.expandObject(config);
    delete config.shape;    delete config.x;    delete config.y;    delete config.z;    delete config._id;
    await game.user.setFlag('drawing-presets', `presets.${randomID()}`, {name, config});
    if (app.object._object) return app.render(true);
    await game.settings.set("core", DrawingsLayer.DEFAULT_CONFIG_SETTING, config);
    canvas.drawings.configureDefault();
  }));
  if (game.user.getFlag('drawing-presets', 'presets'))
  for (let [id, preset] of Object.entries(game.user.getFlag('drawing-presets', 'presets'))) {
    let $preset = $(`<div id="${id}" style="margin: 3px 0; padding: .2em ; border: 1px solid var(--color-border-light-primary)" name="${preset.name}" >${preset.name}</div>`).dblclick(function(){$(this).find('a.apply').click()});
    let $apply = $('<a class="apply" data-tooltip="Apply Preset"><i class="fa-solid fa-upload"></i></a>').click(async function(){
      if (app.object._object)  return app.object.update(preset.config);
      else await game.settings.set("core", DrawingsLayer.DEFAULT_CONFIG_SETTING, preset.config)
      canvas.drawings.configureDefault()
    });
    let $update = $('<a class="update" data-tooltip="Update Preset"><i class="fa-solid fa-floppy-disk"></i></a>').click(async function(){
      let formArray = html.find('form').serializeArray()
      let config = formArray.reduce((config, field)=>{config[field.name]=field.value; return config;},{});
      config = foundry.utils.expandObject(config);
      console.log(config);
      delete config.shape;    delete config.x;    delete config.y;    delete config.z;    delete config._id; console.log(config);
      await game.user.setFlag('drawing-presets', `presets.${$(this).parent().attr('id')}.config`, config);
      if (app.object._object) return app.object.update(preset.config);
      await game.settings.set("core", DrawingsLayer.DEFAULT_CONFIG_SETTING, config);
      canvas.drawings.configureDefault();
    });
    let $delete = $('<a class="delete" data-tooltip="Delete Preset"><i class="fa-solid fa-trash"></i></a>').click(async function(){
      await game.user.unsetFlag('drawing-presets', `presets.${$(this).parent().attr('id')}`);
      if (app.object._object) return app.render(true);
      canvas.drawings.configureDefault();
    });
    let $colorspan = $(`<span style="color:${preset.config.strokeColor}; opacity: ${preset.config.strokeAlpha};" title='${JSON.stringify(preset.config, function (k, v) { return k && v && typeof v !== "number" ? "" + v : v; }, "  ")}'>&emsp;&#9632;</span>`)
    let $widthspan = $(`<span style="opacity: ${preset.config.strokeAlpha};" title='${JSON.stringify(preset.config, function (k, v) { return k && v && typeof v !== "number" ? "" + v : v; }, "  ")}'>${preset.config.strokeWidth}px</span>`);
    $preset.append($delete).append($update).append($apply).append($widthspan).append($colorspan);
    $preset.find('a, span').css({float:'right', margin: '0 .5em'});
    $presets.append($preset);
  }
  if (app.element) html = app.element;
  html.find('form').append($presets);
})