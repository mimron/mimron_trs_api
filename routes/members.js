const express = require("express");
const router = express.Router();
const Member = require("../models").Member;
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
    Member.findAll()
          .then((members) => {
            // res.status(200).send(members)
            let datas = [];

            members.forEach((obj) => {
                datas.push({
                id: obj.id,
                branch_id: obj.branch_id,
                rep_id: obj.rep_id,
                name: obj.name,
                current_position: obj.current_position,
                manager_id: obj.manager_id,
              });
            });

            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet("Data Member");

            worksheet.columns = [
              { header: "Id", key: "id", width: 5 },
              { header: "Branch", key: "branch_id", width: 25 },
              { header: "Rep", key: "rep_id", width: 25 },
              { header: "Name", key: "name", width: 10 },
              { header: "Position", key: "current_position", width: 10 },
              { header: "Manager", key: "manager_id", width: 10 },
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
