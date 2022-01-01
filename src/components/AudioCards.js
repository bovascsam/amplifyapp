import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { API, Storage } from 'aws-amplify';
import { listCategorys, listMasters, listNotes } from '../graphql/queries';
const image1 = require('../Assets/images/sample1.jpg')
const image2 = require('../Assets/images/sample 2.jpg')
const image3 = require('../Assets/images/sample3.jpg')
const useStyles = makeStyles({
    margin0: {
        margin: 0
    },
    intro: {
        backgroundColor: "#00000038",
        color: "#fff",
        padding: "2%",
        borderBottom: "1px solid",
        marginBottom: "1%"
    },
    goBack: {
        float: 'left',
        cursor:'pointer'
    },
    root: {
        maxWidth: 345,
        height:"100%"
    },
    media: {
        height: 180,
    },
    outerDiv: {
        height: 'auto',
        backgroundColor: '#333',
    },
    gridContainer: {
        padding: "2%"
    },
    gridItem: {
        marginRight: "1%",
        marginBottom:"1%",
        height:370
    },
    categoryHeading: {
        margin: 0,
        textAlign: 'left',
        color: "#fff",
        paddingLeft: "2%",
        fontSize: 22
    }
});
const sampleContent = [{
    "thumbnail": image1,
    "description": ""
}]
export default function MediaCard(props) {
    const classes = useStyles();

    const [master, setMaster] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchMaster();
    }, []);

    async function fetchMaster() {
        const apiData = await API.graphql({ query: listMasters });
        let masterData = apiData.data.listMasters.items;
        await Promise.all(masterData.map(async data => {
            if (data.Image) {
                const image = await Storage.get(data.Image);
                data.Image = image;
            }
            if (data.Video) {
                const video = await Storage.get(data.Video);
                data.Video = video;
            }
            return data;
        }))
        masterData = masterData.sort((a, b) => a.updatedAt < b.updatedAt ? 1 : -1);
        setMaster(apiData.data.listMasters.items);
        fetchCategories(apiData.data.listMasters.items);
    }
    async function fetchCategories(masterItems) {
        const apiData = await API.graphql({ query: listCategorys });
        let categories = [], tempMaster = masterItems;
        apiData.data.listCategorys.items.map((category) => {
            categories.push({
                "value": category.name,
                "label": category.id,
                "items": tempMaster.filter((i) => i.CategoryId == category.id)
            })
        })
        setCategories(categories);
    }

    return (
        <div className={classes.outerDiv}>
            <div className={classes.intro}>
                <div onClick={e=> props.activeView(e,"Admin")}><ArrowBackIosNewRoundedIcon className={classes.goBack} /></div>
                <h4 className={classes.margin0}>SCRIPTURE AUDIO FOR ALL</h4>
                <br />
                <h2 className={classes.margin0}>THAT ALL MAY HEAR THE TRUTH</h2>
            </div>
            <div><p className={classes.categoryHeading}>Latest uploads</p></div>
            <Grid container className={classes.gridContainer}>
                {master.map((item, index) => {
                    return (<Grid item xs={12} lg={2} md={2} sm={2} className={classes.gridItem}><Card className={classes.root}>
                        <CardActionArea>
                            <CardMedia
                                className={classes.media}
                                image={item.Image}
                                title={item.Title} />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {item.Title}
                                </Typography>
                                <Typography gutterBottom variant="h6" component="h4">
                                    {item.Language}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                        <CardActions>
                            <audio controls>
                                <source src={item.Video} type="audio/mpeg"></source>

                            </audio>
                            {/* <Button size="small" color="primary">
            Learn More
        </Button> */}
                        </CardActions>
                    </Card></Grid>);
                })}
            </Grid>
            {
                categories.map((category, index) => {
                    return (
                        <><div><p className={classes.categoryHeading}>{category.value}</p></div>
                            <Grid container className={classes.gridContainer}>
                                {category.items.map((item, index) => {
                                    return (<Grid item xs={12} lg={2} md={2} sm={2} className={classes.gridItem}><Card className={classes.root}>
                                        <CardActionArea>
                                            <CardMedia
                                                className={classes.media}
                                                image={item.Image}
                                                title={item.Title} />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    {item.Title}
                                                </Typography>

                                            </CardContent>
                                        </CardActionArea>
                                        <CardActions>
                                            <audio controls>
                                                <source src={item.Video} type="audio/mpeg"></source>

                                            </audio>
                                        </CardActions>
                                    </Card></Grid>);
                                })}
                            </Grid></>
                    );
                })
            }
        </div>
    );
}
