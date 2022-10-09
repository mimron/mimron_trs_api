const express = require("express");

const router = express.Router();
const Member = require("../models").Member;
const sequelize = require("../models").sequelize;
const passport = require("passport");
const excel = require("exceljs");
require("../config/passport")(passport);
const Helper = require("../utils/helper");
const helper = new Helper();

// Create a new Member
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false,
  }),
  function (req, res) {
    helper
      .checkPermission(req.user.role_id, "member_add")
      .then((rolePerm) => {
        if (
          !req.body.branch_id ||
          !req.body.rep_id ||
          !req.body.name ||
          !req.body.current_position ||
          !req.body.manager_id
        ) {
          res.status(400).send({
            msg: "Please pass Member name, description, image or price.",
          });
        } else {
          Member.create({
            branch_id: req.body.branch_id,
            rep_id: req.body.rep_id,
            name: req.body.name,
            current_position: req.body.current_position,
            manager_id: req.body.manager_id,
          })
            .then((member) => res.status(201).send(member))
            .catch((error) => {
              console.log(error);
              res.status(400).send(error);
            });
        }
      })
      .catch((error) => {
        res.status(403).send(error);
      });
  }
);

// Get List of Members
router.get(
  "/",
  passport.authenticate("jwt", {
    session: false,
  }),
  function (req, res) {
    helper
      .checkPermission(req.user.role_id, "member_get_all")
      .then((rolePerm) => {
        Member.findAll()
          .then((members) => res.status(200).send(members))
          .catch((error) => {
            res.status(400).send(error);
          });
      })
      .catch((error) => {
        res.status(403).send(error);
      });
  }
);

// Get Member by ID
router.get(
  "/:id",
  passport.authenticate("jwt", {
    session: false,
  }),
  function (req, res) {
    helper
      .checkPermission(req.user.role_id, "member_get")
      .then((rolePerm) => {
        Member.findByPk(req.params.id)
          .then((member) => res.status(200).send(member))
          .catch((error) => {
            res.status(400).send(error);
          });
      })
      .catch((error) => {
        res.status(403).send(error);
      });
  }
);

// Update a Member
router.put(
  "/:id",
  passport.authenticate("jwt", {
    session: false,
  }),
  function (req, res) {
    helper
      .checkPermission(req.user.role_id, "member_update")
      .then((rolePerm) => {
        if (
          !req.body.branch_id ||
          !req.body.rep_id ||
          !req.body.name ||
          !req.body.current_position ||
          !req.body.manager_id
        ) {
          res.status(400).send({
            msg: "Please pass Member branch_id, rep_id, name, current_position",
          });
        } else {
          Member.findByPk(req.params.id)
            .then((member) => {
              Member.update(
                {
                  branch_id: req.body.branch_id || user.branch_id,
                  rep_id: req.body.rep_id || user.rep_id,
                  name: req.body.name || user.name,
                  current_position:
                    req.body.current_position || user.current_position,
                  manager_id: req.body.manager_id || user.manager_id,
                },
                {
                  where: {
                    id: req.params.id,
                  },
                }
              )
                .then((_) => {
                  res.status(200).send({
                    message: "Member updated",
                  });
                })
                .catch((err) => res.status(400).send(err));
            })
            .catch((error) => {
              res.status(400).send(error);
            });
        }
      })
      .catch((error) => {
        res.status(403).send(error);
      });
  }
);

// Delete a Member
router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false,
  }),
  function (req, res) {
    helper
      .checkPermission(req.user.role_id, "member_delete")
      .then((rolePerm) => {
        if (!req.params.id) {
          res.status(400).send({
            msg: "Please pass member ID.",
          });
        } else {
          Member.findByPk(req.params.id)
            .then((member) => {
              if (member) {
                Member.destroy({
                  where: {
                    id: req.params.id,
                  },
                })
                  .then((_) => {
                    res.status(200).send({
                      message: "Member deleted",
                    });
                  })
                  .catch((err) => res.status(400).send(err));
              } else {
                res.status(404).send({
                  message: "Member not found",
                });
              }
            })
            .catch((error) => {
              res.status(400).send(error);
            });
        }
      })
      .catch((error) => {
        res.status(403).send(error);
      });
  }
);

// Get Member downnload
router.get(
  "/download/excel",
  //   passport.authenticate("jwt", {
  //     session: false,
  //   }),
  function (req, res) {
    sequelize
      .query(
        `SELECT 
    t1.rep_id as mst_gepd, t1.name as name_gepd, 
    t2.rep_id as mst_epd, t2.name as name_epd, 
    t3.branch_id, t3.name as name
    FROM Members AS t1
    LEFT JOIN Members AS t2 ON t2.manager_id = t1.rep_id
    LEFT JOIN Members AS t3 ON t3.manager_id = t2.rep_id
    WHERE t3.name IS NOT NULL`,
        { raw: true }
      )
      .then((results) => {
        // res.status(200).send(members)
        let datas = [];

        results[0].forEach((obj) => {
          datas.push({
            mst_gepd: obj.mst_gepd,
            name_gepd: obj.name_gepd,
            mst_epd: obj.mst_epd,
            name_epd: obj.name_epd,
            branch_id: obj.branch_id,
            name: obj.name,
          });
        });

        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("Data Member");

        worksheet.columns = [
          { header: "mst_gepd", key: "mst_gepd", width: 25 },
          { header: "name_gepd", key: "name_gepd", width: 25 },
          { header: "mst_epd", key: "mst_epd", width: 25 },
          { header: "name_epd", key: "name_epd", width: 25 },
          { header: "branch_id", key: "branch_id", width: 25 },
          { header: "name", key: "name", width: 25 },
        ];

        // Add Array Rows
        worksheet.addRows(datas);

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "members.xlsx"
        );

        return workbook.xlsx.write(res).then(function () {
          res.status(200).end();
        });
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  }
);

module.exports = router;
