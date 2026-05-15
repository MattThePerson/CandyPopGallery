package routes

import (
    "github.com/labstack/echo/v4"

    "github.com/MattThePerson/CandyPopGallery/internal"
)

// IncludeAdminRoutes: routes that deal with administraction of the backend, ie. dashboard functionality.
//  GET         /admin/setup-complete
//  GET|POST    /admin/config
//  GET         /admin/config/reload            # reloads config.yaml
//  GET         /admin/generate/preview-media
//  GET         /admin/generate/tfidf
func IncludeAdminRoutes(e *echo.Echo, app *internal.App) {

    e.GET("/admin/setup-complete", func (c echo.Context) error {
        config, err := internal.ReadConfigFromYaml(app.AppDataDir)
        if err != nil {
            return handleServerError(c, 500, "failed to read config", err)
        }
        app.Config = config
        if app.Config == nil {
            return c.JSON(200, map[string]bool{"done": false})
        }
        return c.JSON(200, map[string]bool{"done": true})
    })

    e.GET("/admin/config", func (c echo.Context) error {
        if app.Config == nil {
            default_conf := internal.GetDefaultConfig()
            return c.JSON(200, default_conf)
        }
        return c.JSON(200, app.Config)
    })

    e.POST("/admin/config", func (c echo.Context) error {
        var config internal.Config
        if err := c.Bind(&config); err != nil {
            return handleServerError(c, 500, "unable to bind recieved JSON to Config struct", err)
        }
        internal.WriteConfigToYaml(config, app.AppDataDir)
        app.Config = &config
        return c.JSON(200, map[string]bool{"ok": true})
    })

    e.POST("/admin/config/reload", func (c echo.Context) error {
        config, err := internal.ReadConfigFromYaml(app.AppDataDir)
        if err != nil {
            return handleServerError(c, 500, "failed to read config", err)
        }
        app.Config = config
        return handleOK(c)
    })

}
